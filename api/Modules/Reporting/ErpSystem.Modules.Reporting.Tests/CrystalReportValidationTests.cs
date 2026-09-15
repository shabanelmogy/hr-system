using ErpSystem.Modules.Platform.Contracts.Files.Models;
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
        var validator = new GetPublishedCrystalReportsQueryValidator();

        Assert.True(validator.Validate(new GetPublishedCrystalReportsQuery("sales-orders", null)).IsValid);
        Assert.False(validator.Validate(new GetPublishedCrystalReportsQuery("sales_orders", null)).IsValid);
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
}
