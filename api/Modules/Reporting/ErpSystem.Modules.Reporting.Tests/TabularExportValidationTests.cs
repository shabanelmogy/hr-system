using System.Text.Json;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class TabularExportValidationTests
{
    private static GenerateTabularExportQuery Request(List<Dictionary<string, object>>? rows = null) =>
        new(rows ?? [new() { ["Name"] = "مصر", ["Value"] = 1 }], "xlsx", "Countries", "ar");

    [Fact]
    public void GlobalRequest_AcceptsOnlyBoundedScalarRowsAndSafeMetadata()
    {
        var validator = new GenerateTabularExportValidator();
        Assert.True(validator.Validate(Request()).IsValid);
        Assert.False(validator.Validate(Request([])).IsValid);
        Assert.False(validator.Validate(Request() with { Format = "pdf" }).IsValid);
        Assert.False(validator.Validate(Request() with { FileName = "../secret" }).IsValid);
        Assert.False(validator.Validate(Request() with { FileName = "report.csv" }).IsValid);
        Assert.False(validator.Validate(Request() with { Culture = "xx" }).IsValid);
        Assert.False(validator.Validate(Request([new() { ["nested"] = JsonSerializer.Deserialize<JsonElement>("{}") }])).IsValid);
        Assert.False(validator.Validate(Request([new() { ["number"] = double.NaN }])).IsValid);
        Assert.False(validator.Validate(Request([new() { ["text"] = new string('x', 32768) }])).IsValid);
        Assert.False(validator.Validate(Request([new() { ["Name"] = 1, ["name"] = 2 }])).IsValid);
    }

    [Fact]
    public void Limits_RejectWideTallAndOversizedEnvelopesWithoutSilentTruncation()
    {
        var validator = new GenerateTabularExportValidator();
        var wide = Enumerable.Range(0, 201).ToDictionary(index => "Column" + index, _ => (object)1);
        Assert.False(validator.Validate(Request([wide])).IsValid);
        var row = new Dictionary<string, object> { ["ID"] = 1 };
        Assert.False(validator.Validate(Request(Enumerable.Repeat(row, 100001).ToList())).IsValid);
        var manyCells = Enumerable.Range(0, 200).ToDictionary(index => "C" + index, _ => (object)1);
        Assert.False(validator.Validate(Request(Enumerable.Repeat(manyCells, 10001).ToList())).IsValid);
        var longRow = new Dictionary<string, object> { ["Text"] = new string('x', 32767) };
        Assert.False(validator.Validate(Request(Enumerable.Repeat(longRow, 260).ToList())).IsValid);
    }
}
