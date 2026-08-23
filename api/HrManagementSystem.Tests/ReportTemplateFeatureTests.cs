using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Validation;
using HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;
using HrManagementSystem.Infrastructure.Features.Analytics.ReportTemplates.Persistence;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class ReportTemplateFeatureTests
{
    private const string ValidDefinition =
        """
        {
          "Name": "CountriesDirectory",
          "Body": {},
          "DataSources": [
            {
              "Name": "Countries",
              "ConnectionProperties": {
                "DataProvider": "JSON",
                "ConnectString": "endpoint=/api/v1/countries/report-data"
              }
            }
          ]
        }
        """;

    [Fact]
    public void DefinitionSafety_AcceptsApprovedEnvironmentNeutralRdlxJson()
    {
        Assert.True(ReportTemplateDefinitionSafety.IsSafe(ValidDefinition));
        var descriptor = ReportTemplateDefinitionSafety.CountriesDescriptor();
        Assert.Equal("JSON", descriptor.DataProvider);
        Assert.Equal("endpoint=/api/v1/countries/report-data", descriptor.ConnectString);
        Assert.Equal("/api/v1/countries/report-data", descriptor.RelativeApiPath);
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("[]")]
    [InlineData("{broken")]
    [InlineData("{\"Name\":\"Countries\",\"Body\":{},\"Url\":\"https://api.example.test/countries\"}")]
    [InlineData("{\"Name\":\"Countries\",\"Body\":{},\"Connection\":\"Server=db;Database=hr;User Id=u;Password=p\"}")]
    [InlineData("{\"Name\":\"Countries\",\"Body\":{},\"Password\":\"secret\"}")]
    [InlineData("{\"Name\":\"Countries\",\"Body\":{},\"ConnectString\":\"endpoint=/api/v1/users\"}")]
    public void DefinitionSafety_RejectsInvalidOrUnsafeDefinitions(string definition)
    {
        Assert.False(ReportTemplateDefinitionSafety.IsSafe(definition));
    }

    [Theory]
    [InlineData("false")]
    [InlineData("true")]
    public void DefinitionSafety_AcceptsRdlxPasswordDisplayFlag(string passwordFlag)
    {
        var definition =
            $$"""
            {
              "Name": "CountriesDirectory",
              "Body": {
                "ReportItems": [
                  {
                    "Type": "textbox",
                    "Name": "PdfInput",
                    "Password": {{passwordFlag}}
                  }
                ]
              },
              "DataSources": [
                {
                  "Name": "Countries",
                  "ConnectionProperties": {
                    "DataProvider": "JSON",
                    "ConnectString": "endpoint=/api/v1/countries/report-data"
                  }
                }
              ]
            }
            """;

        Assert.True(ReportTemplateDefinitionSafety.IsSafe(definition));
    }

    [Fact]
    public void DefinitionSafety_AcceptsDesignerSectionedRdlxJson()
    {
        const string definition =
            """
            {
              "Name": "CountriesDirectory",
              "ReportSections": [
                {
                  "Name": "ContinuousSection1",
                  "Type": "Continuous",
                  "Body": {
                    "ReportItems": [
                      {
                        "Type": "textbox",
                        "Name": "PdfInput",
                        "Password": false
                      }
                    ]
                  }
                }
              ],
              "DataSources": [
                {
                  "Name": "Countries",
                  "ConnectionProperties": {
                    "DataProvider": "JSON",
                    "ConnectString": "endpoint=/api/v1/countries/report-data"
                  }
                }
              ]
            }
            """;

        Assert.True(ReportTemplateDefinitionSafety.IsSafe(definition));
    }

    [Theory]
    [InlineData("[]")]
    [InlineData("[{\"Name\":\"Section1\",\"Type\":\"Continuous\"}]")]
    [InlineData("[{\"Name\":\"Section1\",\"Type\":\"Unknown\",\"Body\":{}}]")]
    public void DefinitionSafety_RejectsInvalidReportSections(string sections)
    {
        var definition = $$"""{"Name":"Countries","ReportSections":{{sections}}}""";

        Assert.False(ReportTemplateDefinitionSafety.IsSafe(definition));
    }

    [Fact]
    public void DefinitionSafety_RejectsDefinitionsOverOneMiB()
    {
        var oversized = $$"""{"Name":"Countries","Body":{},"Padding":"{{new string('x', ReportTemplateDefinitionSafety.MaxUtf8Bytes)}}"}""";

        Assert.False(ReportTemplateDefinitionSafety.IsSafe(oversized));
    }

    [Fact]
    public async Task TenantQueryFilter_HidesTemplatesAndRevisionsFromOtherTenants()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        await using (var tenantA = CreateContext(databaseName, "tenant-a"))
        {
            tenantA.ReportTemplates.Add(CreateTemplate("Tenant A report"));
            await tenantA.SaveChangesAsync();
            Assert.Single(await tenantA.ReportTemplates.ToListAsync());
            Assert.Single(await tenantA.ReportTemplateRevisions.ToListAsync());
        }

        await using var tenantB = CreateContext(databaseName, "tenant-b");
        Assert.Empty(await tenantB.ReportTemplates.ToListAsync());
        Assert.Empty(await tenantB.ReportTemplateRevisions.ToListAsync());
    }

    [Fact]
    public async Task Store_DoesNotLoadRevisionHistory_AndNewSnapshotIsTrackedOnUpdate()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        Guid id;
        await using (var setup = CreateContext(databaseName, "tenant-a"))
        {
            var template = CreateTemplate("Countries");
            id = template.Id;
            setup.ReportTemplates.Add(template);
            await setup.SaveChangesAsync();
        }

        await using var context = CreateContext(databaseName, "tenant-a");
        var store = new ReportTemplateStore(context);
        var loaded = await store.GetForUpdateAsync(id, default);
        Assert.NotNull(loaded);
        Assert.False(context.Entry(loaded).Collection(template => template.Revisions).IsLoaded);

        loaded.Update(
            "Countries v2",
            null,
            ReportTemplateDefinitionSafety.CountriesDataSourceKey,
            ValidDefinition,
            ReportTemplateDefinitionSafety.ComputeHash(ValidDefinition));
        await context.SaveChangesAsync();

        Assert.Equal(2, await context.ReportTemplateRevisions.CountAsync());
    }

    [Fact]
    public async Task Revisions_AreAppendOnly()
    {
        await using var context = CreateContext(Guid.NewGuid().ToString("N"), "tenant-a");
        context.ReportTemplates.Add(CreateTemplate("Countries"));
        await context.SaveChangesAsync();
        var revision = await context.ReportTemplateRevisions.SingleAsync();
        context.Entry(revision).State = EntityState.Modified;

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => context.SaveChangesAsync());
        Assert.Contains("append-only", exception.Message, StringComparison.Ordinal);
    }

    private static ReportTemplate CreateTemplate(string name) =>
        ReportTemplate.Create(
            ReportTemplateDefinitionSafety.CountriesFeatureKey,
            name,
            null,
            ReportTemplateDefinitionSafety.CountriesDataSourceKey,
            ValidDefinition,
            ReportTemplateDefinitionSafety.ComputeHash(ValidDefinition));

    private static ApplicationDbContext CreateContext(string databaseName, string tenantId) =>
        new(
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options,
            new TestCurrentActor("actor", tenantId),
            TimeProvider.System);

    private sealed class TestCurrentActor(string userId, string tenantId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId => null;
    }
}
