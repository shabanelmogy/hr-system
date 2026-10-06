using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportValidationTests
{
    [Theory]
    [InlineData("sales-orders", true)]
    [InlineData("sales_orders", false)]
    [InlineData("sales.orders", false)]
    [InlineData("-sales", false)]
    [InlineData("sales-", false)]
    [InlineData("sales--orders", false)]
    public void EntityKey_UsesOneCanonicalHyphenatedGrammar(string entityKey, bool expectedValid)
    {
        var validator = new CreateCrystalReportCommandValidator();
        var upload = new FileUpload(
            "sales-orders.rpt",
            "application/octet-stream",
            8,
            () => new MemoryStream(new byte[8], writable: false));

        var result = validator.Validate(new CreateCrystalReportCommand(entityKey, null, upload));

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Fact]
    public void QueryEntityKey_UsesTheSameCanonicalGrammar()
    {
        var validator = new GetPublishedCrystalReportsQueryValidator(new StubContractSource("sales-orders"));

        Assert.True(validator.Validate(new GetPublishedCrystalReportsQuery("sales-orders", null)).IsValid);
        Assert.False(validator.Validate(new GetPublishedCrystalReportsQuery("sales_orders", null)).IsValid);
    }

    [Fact]
    public void EntityFilters_RejectWellFormedButUnsupportedManagedEntityKeys()
    {
        var contracts = new StubContractSource("countries", "fiscalyears");

        Assert.True(new GetPublishedCrystalReportsQueryValidator(contracts)
            .Validate(new GetPublishedCrystalReportsQuery("fiscalyears", null)).IsValid);
        Assert.False(new GetPublishedCrystalReportsQueryValidator(contracts)
            .Validate(new GetPublishedCrystalReportsQuery("not-a-managed-entity", null)).IsValid);
        Assert.False(new GetCrystalReportsManagementQueryValidator(contracts)
            .Validate(new GetCrystalReportsManagementQuery(
                "not-a-managed-entity", null, null, 1, 10)).IsValid);
        Assert.False(new GetDiscoveredCrystalReportsQueryValidator(contracts)
            .Validate(new GetDiscoveredCrystalReportsQuery("not-a-managed-entity")).IsValid);
    }

    [Theory]
    [InlineData("AQIDBAUGBwg=", true)]
    [InlineData("AQID", false)]
    [InlineData("not-base64", false)]
    public void MutationRowVersion_MustBeExactlyEightBytes(string rowVersion, bool expectedValid)
    {
        var publish = new PublishCrystalReportVersionCommandValidator().Validate(
            new PublishCrystalReportVersionCommand(Guid.NewGuid(), Guid.NewGuid(), rowVersion));
        var archive = new ArchiveCrystalReportCommandValidator().Validate(
            new ArchiveCrystalReportCommand(Guid.NewGuid(), rowVersion));
        var grants = new ReplaceCrystalReportGrantsCommandValidator().Validate(
            new ReplaceCrystalReportGrantsCommand(
                Guid.NewGuid(),
                rowVersion,
                [new CrystalReportGrantRequest("role-1", ["Run"])]));

        Assert.Equal(expectedValid, publish.IsValid);
        Assert.Equal(expectedValid, archive.IsValid);
        Assert.Equal(expectedValid, grants.IsValid);
    }

    private sealed class StubContractSource(params string[] supportedEntities)
        : IManagedCrystalReportContractSource
    {
        public int SchemaVersion => 1;

        public string Fingerprint { get; } = new('a', 64);

        public IReadOnlyCollection<ManagedCrystalReportEntityDescriptor> EntityDescriptors { get; } =
            supportedEntities.Select(entityKey =>
                new ManagedCrystalReportEntityDescriptor(
                    entityKey,
                    "tenant-company",
                    [])).ToArray();

        public bool Supports(string entityKey) =>
            supportedEntities.Contains(entityKey, StringComparer.OrdinalIgnoreCase);
    }
}
