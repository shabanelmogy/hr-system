using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Contracts.Features.Analytics.CrystalReports;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ManagedCrystalReportContractRegistryTests(Xunit.Abstractions.ITestOutputHelper output)
{
    [Fact]
    public void EntityFingerprintVectorsMatchThePortableRuntimeProtocol()
    {
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();
        foreach (var entity in registry.Entities)
        {
            var fingerprint = registry.GetFingerprint(entity.EntityKey);
            Assert.Matches("^[a-f0-9]{64}$", fingerprint);
            Assert.NotEqual(registry.Fingerprint, fingerprint);
            output.WriteLine($"entity-fingerprint:{entity.EntityKey}={fingerprint}");
        }
    }

    [Fact]
    public void AddingAnUnrelatedReportDoesNotInvalidateCountries()
    {
        var bytes = ManagedCrystalReportContractArtifact.ReadAllBytes();
        var document = JsonNode.Parse(bytes)!.AsObject();
        var entities = document["entities"]!.AsArray();
        entities.Remove(entities.Single(entity => entity!["entityKey"]!.GetValue<string>() == "system-error-logs"));
        IManagedCrystalReportContractSource before = ManagedCrystalReportContractRegistry.Load(Encoding.UTF8.GetBytes(document.ToJsonString()));
        IManagedCrystalReportContractSource after = ManagedCrystalReportContractRegistry.Load(bytes);

        Assert.NotEqual(before.Fingerprint, after.Fingerprint);
        Assert.Equal(before.GetFingerprint("countries"), after.GetFingerprint("countries"));
    }

    [Fact]
    public void FormattingAndEntityOrderDoNotChangeValidationFingerprints()
    {
        var bytes = ManagedCrystalReportContractArtifact.ReadAllBytes();
        var document = JsonNode.Parse(bytes)!.AsObject();
        var entities = document["entities"]!.AsArray();
        var reversed = entities.Reverse().Select(entity => entity!.DeepClone()).ToArray();
        entities.Clear();
        foreach (var entity in reversed) entities.Add(entity);
        var original = ManagedCrystalReportContractRegistry.Load(bytes);
        var formatted = ManagedCrystalReportContractRegistry.Load(Encoding.UTF8.GetBytes(document.ToJsonString()));
        foreach (var entity in original.Entities)
            Assert.Equal(original.GetFingerprint(entity.EntityKey), formatted.GetFingerprint(entity.EntityKey));
    }

    [Theory]
    [InlineData("tableName")]
    [InlineData("maxRows")]
    [InlineData("columnName")]
    [InlineData("columnNullable")]
    [InlineData("filter")]
    public void RealEntityChangesRejectPriorEvidenceButLeaveOtherReportsValid(string mutation)
    {
        var bytes = ManagedCrystalReportContractArtifact.ReadAllBytes();
        var previous = ManagedCrystalReportContractRegistry.Load(bytes);
        var document = JsonNode.Parse(bytes)!.AsObject();
        var country = document["entities"]!.AsArray().Single(entity => entity!["entityKey"]!.GetValue<string>() == "countries")!;
        switch (mutation)
        {
            case "tableName": country["tableName"] = "ChangedReportData"; break;
            case "maxRows": country["maxRows"] = 9999; break;
            case "columnName": country["columns"]![0]!["name"] = "ChangedId"; break;
            case "columnNullable": country["columns"]![0]!["nullable"] = true; break;
            case "filter": country["filters"]!.AsArray().Add("AdditionalFilter"); break;
        }
        var current = ManagedCrystalReportContractRegistry.Load(Encoding.UTF8.GetBytes(document.ToJsonString()), [bytes]);
        Assert.NotEqual(previous.GetFingerprint("countries"), current.GetFingerprint("countries"));
        Assert.False(current.IsCompatibleFingerprint("countries", previous.Fingerprint));
        Assert.False(current.IsCompatibleFingerprint("countries", previous.GetFingerprint("countries")));
        Assert.Equal(previous.GetFingerprint("states"), current.GetFingerprint("states"));
        Assert.True(current.IsCompatibleFingerprint("states", previous.Fingerprint));
    }

    [Fact]
    public void LegacyEvidenceRequiresAnExactReviewedMatchingEntityDefinition()
    {
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();
        var historicalBytes = ManagedCrystalReportContractArtifact.ReadLegacyArtifacts().ToArray();
        Assert.Equal(2, historicalBytes.Length);
        foreach (var bytes in historicalBytes)
        {
            var historical = ManagedCrystalReportContractRegistry.Load(bytes);
            Assert.True(registry.IsCompatibleFingerprint("countries", historical.Fingerprint));
            var windowsBytes = Encoding.UTF8.GetBytes(Encoding.UTF8.GetString(bytes)
                .Replace("\r\n", "\n", StringComparison.Ordinal)
                .Replace("\n", "\r\n", StringComparison.Ordinal));
            var windowsFingerprint = Convert.ToHexString(SHA256.HashData(windowsBytes)).ToLowerInvariant();
            Assert.True(registry.IsCompatibleFingerprint("countries", windowsFingerprint));
        }
        Assert.False(registry.IsCompatibleFingerprint("countries", new string('f', 64)));
        Assert.False(registry.IsCompatibleFingerprint("unknown", registry.Fingerprint));
        Assert.False(registry.IsCompatibleFingerprint("countries", null));
    }

    [Fact]
    public void LoadEmbedded_UsesExactVersionedSixEntityContract()
    {
        var bytes = ManagedCrystalReportContractArtifact.ReadAllBytes();
        var registry = ManagedCrystalReportContractRegistry.LoadEmbedded();

        Assert.Equal(1, registry.SchemaVersion);
        Assert.Equal(6, registry.Count);
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
