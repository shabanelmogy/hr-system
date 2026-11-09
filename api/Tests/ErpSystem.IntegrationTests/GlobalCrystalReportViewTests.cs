using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.ReferenceData.Infrastructure;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.Reporting;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.States.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Districts.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.AddressTypes.Entities;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Infrastructure;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ErpSystem.IntegrationTests;

public sealed class GlobalCrystalReportViewTests
{
    [SqlServerFact]
    public async Task PreparedViews_IncludeRootColumnsPreserveLeftJoinsAndScopeAddressCounts()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpPreparedViews");
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseSqlServer(database.ConnectionString, sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "ref")).Options;
        await using var reference = new ReferenceDataDbContext(options, new Actor("tenant-a", 1));
        await reference.Database.MigrateAsync();
        var country = new Country { NameAr = "مصر", NameEn = "Egypt" };
        var state = new State { NameAr = "القاهرة", NameEn = "Cairo", Code = "CA", Country = country };
        var district = new District { NameAr = "وسط", NameEn = "Central", Code = "CT", State = state };
        reference.Districts.Add(district);
        reference.States.Add(new State { NameAr = "الجيزة", NameEn = "Giza", Code = "GZ", Country = country });
        reference.Countries.Add(new Country { NameAr = "الأردن", NameEn = "Jordan" });
        await reference.SaveChangesAsync();

        foreach (var table in new[] { "Countries", "States", "Districts" })
        {
            var missing = await reference.Database.SqlQuery<int>($"""
                SELECT COUNT(*) AS Value FROM sys.columns root
                WHERE root.object_id=OBJECT_ID({"ref." + table}) AND NOT EXISTS (
                    SELECT 1 FROM sys.columns projected WHERE projected.object_id=OBJECT_ID({"ref.vw_" + table})
                    AND projected.name=root.name AND projected.system_type_id=root.system_type_id)
                """).SingleAsync();
            Assert.Equal(0, missing);
        }
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var reader = new ReferenceDataPublicViewSource(reference);
        var source = new GlobalCrystalReportViewSource(reader, registry, Options.Create(new CrystalReportStorageOptions()));
        foreach (var key in new[] { "countries", "states", "districts" })
        {
            var view = "ref.vw_" + char.ToUpperInvariant(key[0]) + key[1..];
            Assert.NotNull(await source.InspectAsync(key, view, default));
        }
        var countries = await reader.ReadAsync("ref.vw_Countries", "countries", 10,
            new Dictionary<string, string?>(), default, ["CountryEn", "StateEn"]);
        Assert.Equal(3, countries!.Rows.Count);
        Assert.Contains(countries.Rows, row => Equals(row[0], "Jordan") && row[1] is null);
        Assert.Equal(2, countries.Rows.Count(row => Equals(row[0], "Egypt")));

        var type = new AddressType { NameAr = "سكن", NameEn = "Home" };
        reference.Addresses.AddRange(
            new Address { CountryId = country.Id, StateId = state.Id, DistrictId = district.Id, AddressType = type },
            new Address { CountryId = country.Id, StateId = state.Id, DistrictId = district.Id, AddressType = type });
        await reference.SaveChangesAsync();
        await using (var other = new ReferenceDataDbContext(options, new Actor("tenant-a", 2)))
        {
            other.Addresses.Add(new Address { CountryId = country.Id, StateId = state.Id, DistrictId = district.Id,
                AddressType = new AddressType { NameAr = "عمل", NameEn = "Work" } });
            await other.SaveChangesAsync();
            var otherReader = new ReferenceDataPublicViewSource(other);
            var otherRows = await otherReader.ReadAsync("ref.vw_Districts", "districts", 10,
                new Dictionary<string, string?>(), default, ["DistrictId", "AddressesCount"]);
            Assert.Equal(1, Assert.Single(otherRows!.Rows)[1]);
        }
        var binding = await source.InspectAsync("districts", "ref.vw_Districts", default);
        var data = await source.BuildAsync("districts", binding!.ViewName, binding.Fingerprint,
            new Dictionary<string, string?>(), default);
        Assert.True(data.IsSuccess);
        Assert.Contains("<AddressesCount>2</AddressesCount>", data.Data!.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("CreatedBy", data.Data.Xml, StringComparison.Ordinal);
        country.IsDeleted = true;
        await reference.SaveChangesAsync();
        var states = await reader.ReadAsync("ref.vw_States", "states", 10,
            new Dictionary<string, string?>(), default, ["StateEn", "CountryEn", "Country_NameEn"]);
        Assert.Equal(2, states!.Rows.Count);
        Assert.All(states.Rows, row => { Assert.Equal("", row[1]); Assert.Null(row[2]); });
        Assert.Empty((await reader.ReadAsync("ref.vw_Countries", "countries", 10,
            new Dictionary<string, string?> { ["CountryEn"] = "Egypt" }, default))!.Rows);
    }

    [SqlServerFact]
    public async Task ManualGlobalView_InspectsReadsFiltersPinsDefinitionAndPersistsImmutableBinding()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpCrystalView");
        await using var reference = new ReferenceDataDbContext(new DbContextOptionsBuilder<ReferenceDataDbContext>()
            .UseSqlServer(database.ConnectionString, sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "ref")).Options, new Actor());
        await reference.Database.MigrateAsync();
        reference.Countries.AddRange(new Country { NameAr = "مصر", NameEn = "Egypt" },
            new Country { NameAr = "الأردن", NameEn = "Jordan" });
        await reference.SaveChangesAsync();
        const string definition = """
            CREATE OR ALTER VIEW dbo.vw_CrystalCountries WITH SCHEMABINDING AS
            SELECT c.Id AS CountryId,c.NameAr AS CountryAr,c.NameEn AS CountryEn,
              CAST(NULL AS int) AS StateId,CAST(NULL AS nvarchar(100)) AS StateAr,CAST(NULL AS nvarchar(100)) AS StateEn
            FROM ref.Countries c WHERE c.IsDeleted=0
            """;
        await reference.Database.ExecuteSqlRawAsync(definition);
        var reader = new ReferenceDataPublicViewSource(reference);
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var source = new GlobalCrystalReportViewSource(reader, registry, Options.Create(new CrystalReportStorageOptions()));
        var binding = await source.InspectAsync("countries", "dbo.vw_CrystalCountries", default);
        Assert.NotNull(binding);
        var filtered = await source.BuildAsync("countries", binding.ViewName, binding.Fingerprint,
            new Dictionary<string, string?> { ["NameEn"] = "Egypt" }, default);
        Assert.True(filtered.IsSuccess);
        Assert.Contains("Egypt", filtered.Data!.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Jordan", filtered.Data.Xml, StringComparison.Ordinal);
        var injection = await source.BuildAsync("countries", binding.ViewName, binding.Fingerprint,
            new Dictionary<string, string?> { ["NameEn"] = "Egypt' OR 1=1--" }, default);
        Assert.True(injection.IsSuccess);
        Assert.DoesNotContain("Egypt</CountryEn>", injection.Data!.Xml, StringComparison.Ordinal);
        Assert.Null(await source.InspectAsync("countries", "dbo.vw_CrystalCountries;DROP TABLE ref.Countries", default));
        await reference.Database.ExecuteSqlRawAsync("CREATE VIEW dbo.vw_Unbound AS SELECT Id FROM ref.Countries");
        Assert.Null(await source.InspectAsync("countries", "dbo.vw_Unbound", default));
        await reference.Database.ExecuteSqlRawAsync("CREATE VIEW dbo.vw_TenantData WITH SCHEMABINDING AS SELECT Id FROM ref.AddressTypes");
        Assert.Null(await source.InspectAsync("countries", "dbo.vw_TenantData", default));
        Assert.Null(await source.InspectAsync("states", "dbo.vw_CrystalCountries", default));
        var catalog = new GlobalCrystalReportViewCatalog(reader, source);
        var discovered = await catalog.ListAsync("countries", null, 1, 50, default);
        Assert.NotNull(discovered);
        Assert.True(Assert.Single(discovered.Items, item => item.ViewName == "dbo.vw_CrystalCountries").IsCompatible);
        Assert.Equal("SchemaBindingRequired", Assert.Single(discovered.Items, item => item.ViewName == "dbo.vw_Unbound").RejectionCode);
        Assert.DoesNotContain(discovered.Items, item => item.ViewName == "dbo.vw_TenantData");
        var firstPage = await catalog.ListAsync("countries", "dbo.", 1, 1, default);
        var secondPage = await catalog.ListAsync("countries", "dbo.", 2, 1, default);
        Assert.Equal(2, firstPage!.TotalCount);
        Assert.Single(firstPage.Items);
        Assert.NotEqual(firstPage.Items[0].ViewName, Assert.Single(secondPage!.Items).ViewName);
        Assert.Empty((await catalog.ListAsync("countries", "'; DROP VIEW dbo.x;--", 1, 20, default))!.Items);
        var wrongShape = await catalog.ListAsync("states", "vw_CrystalCountries", 1, 20, default);
        Assert.Equal("ContractMismatch", Assert.Single(wrongShape!.Items).RejectionCode);

        await using var reports = new ReportingDbContext(new DbContextOptionsBuilder<ReportingDbContext>()
            .UseSqlServer(database.ConnectionString, sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "rpt")).Options, new Actor());
        await reports.Database.MigrateAsync();
        var draft = GlobalCrystalReport.CreateDraft("countries", "countries-manual-view", "Manual View", null, binding.ViewName, binding.Fingerprint);
        reports.GlobalCrystalReports.Add(draft);
        await reports.SaveChangesAsync();
        var detail = await new GlobalCrystalReportStore(reports, ManagedCrystalReportContractRegistry.LoadEmbedded()).DetailAsync(draft.Id, default);
        Assert.Equal(binding.ViewName, detail!.ViewName);
        Assert.Empty(detail.Versions);
        reports.Entry(draft).Property(report => report.ViewName).CurrentValue = "dbo.other";
        await Assert.ThrowsAsync<InvalidOperationException>(() => reports.SaveChangesAsync());
        await reference.Database.ExecuteSqlRawAsync(definition.Replace("c.IsDeleted=0", "c.IsDeleted=0 AND c.Id=1", StringComparison.Ordinal));
        var stale = await source.BuildAsync("countries", binding.ViewName, binding.Fingerprint, new Dictionary<string, string?>(), default);
        Assert.False(stale.IsSuccess);
    }

    private sealed class Actor(string? tenantId = null, int? companyId = null) : ICurrentActor
    {
        public string UserId => "manual-view-test";
        public string? TenantId => tenantId;
        public int? CompanyId => companyId;
        public bool IsInRole(string role) => role == "super_admin";
    }
}


