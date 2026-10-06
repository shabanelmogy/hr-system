using System.Security.Cryptography;
using System.Text;
using ErpSystem.Modules.Reporting.Contracts.Features.Analytics.CrystalReports;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ManagedCrystalReportContractRegistryTests
{
    [Fact]
    public void LoadEmbedded_UsesExactVersionedFiveEntityContract()
    {
        var bytes = ManagedCrystalReportContractArtifact.ReadAllBytes();
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();

        Assert.Equal(1, registry.SchemaVersion);
        Assert.Equal(5, registry.Count);
        Assert.Equal(
            Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),
            registry.Fingerprint);

        Assert.Equal("global", registry.GetRequired("COUNTRIES").Scope);
        Assert.Equal("tenant-company", registry.GetRequired("addresstypes").Scope);

        var fiscalYears = registry.GetRequired("fiscalyears");
        Assert.Equal("tenant-company", fiscalYears.Scope);
        Assert.Equal("ReportData", fiscalYears.TableName);
        Assert.Equal(10_000, fiscalYears.MaxRows);
        Assert.Equal(["Code", "NameAr", "NameEn"], fiscalYears.Filters);
        Assert.Equal(16, fiscalYears.Columns.Count);
        Assert.All(fiscalYears.Columns.Take(8), column => Assert.False(column.Nullable));
        Assert.All(fiscalYears.Columns.Skip(8), column => Assert.True(column.Nullable));
        Assert.Equal(
            [
                "FiscalYearId", "FiscalYearCode", "FiscalYearAr", "FiscalYearEn",
                "FiscalYearStartDate", "FiscalYearEndDate", "PeriodFrequency", "FiscalYearStatus",
                "FiscalPeriodId", "FiscalPeriodSequence", "FiscalPeriodCode", "FiscalPeriodAr",
                "FiscalPeriodEn", "FiscalPeriodStartDate", "FiscalPeriodEndDate", "FiscalPeriodStatus"
            ],
            fiscalYears.Columns.Select(column => column.Name));

        var language = Assert.Single(fiscalYears.Parameters);
        Assert.Equal("Language", language.Name);
        Assert.Equal("string", language.Type);
        Assert.True(language.Required);
        Assert.False(language.AllowMultipleValues);
        Assert.True(language.DiscreteOnly);
        Assert.Equal(["ar", "en"], language.AllowedValues);
    }

    [Theory]
    [InlineData("\"schemaVersion\": 1", "\"schemaVersion\": 2")]
    [InlineData("\"entityKey\": \"states\"", "\"entityKey\": \"countries\"")]
    [InlineData("\"scope\": \"global\"", "\"scope\": \"unsupported\"")]
    [InlineData("\"maxRows\": 10000", "\"maxRows\": 0")]
    [InlineData("\"type\": \"int32\"", "\"type\": \"decimal\"")]
    [InlineData("\"allowMultipleValues\": false", "\"allowMultipleValues\": true")]
    [InlineData("\"filters\": [\"NameAr\", \"NameEn\"]", "\"filters\": [\"NameAr\", \"namear\"]")]
    public void Load_RejectsSemanticallyInvalidArtifacts(string oldValue, string newValue)
    {
        var json = Encoding.UTF8.GetString(ManagedCrystalReportContractArtifact.ReadAllBytes());
        var index = json.IndexOf(oldValue, StringComparison.Ordinal);
        Assert.True(index >= 0, $"Mutation source text was not found: {oldValue}");
        var mutated = string.Concat(
            json.AsSpan(0, index),
            newValue,
            json.AsSpan(index + oldValue.Length));

        Assert.Throws<InvalidDataException>(() =>
            ManagedCrystalReportContractRegistry.Load(Encoding.UTF8.GetBytes(mutated)));
    }

    [Fact]
    public void Load_RejectsMissingRequiredJsonMembersAndUnknownMembers()
    {
        const string missingEntityKey =
            "{\"schemaVersion\":1,\"entities\":[{\"scope\":\"global\",\"tableName\":\"ReportData\",\"maxRows\":1,\"columns\":[],\"filters\":[],\"parameters\":[]}]}";
        const string unknownMember =
            "{\"schemaVersion\":1,\"entities\":[],\"unexpected\":true}";

        Assert.Throws<InvalidDataException>(() =>
            ManagedCrystalReportContractRegistry.Load(Encoding.UTF8.GetBytes(missingEntityKey)));
        Assert.Throws<InvalidDataException>(() =>
            ManagedCrystalReportContractRegistry.Load(Encoding.UTF8.GetBytes(unknownMember)));
    }

    [Fact]
    public void GetRequired_RejectsUnknownEntity()
    {
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();

        Assert.Throws<KeyNotFoundException>(() => registry.GetRequired("unknown"));
    }
}
