using System.Text;
using System.Text.Json;
using ClosedXML.Excel;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Exporting.Services;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class TabularExportTests
{
    [Fact]
    public void Csv_PreservesUnicodeEscapesCellsAndProtectsFormulaHeadersAndText()
    {
        var data = new List<Dictionary<string, object>>
        {
            new() { ["=Header"] = "\u000b=HYPERLINK(\"bad\")", ["Label"] = "مصر,\"القاهرة\"\nسطر", ["Number"] = JsonSerializer.Deserialize<JsonElement>("-12.5") },
            new() { ["Later"] = "other" }
        };
        var text = Encoding.UTF8.GetString(new ExportExcelService().ExportToCsvBytes(data));
        Assert.StartsWith("\uFEFF'=Header,Label,Number,Later\r\n", text, StringComparison.Ordinal);
        Assert.Contains("\"'\u000b=HYPERLINK(\"\"bad\"\")\"", text, StringComparison.Ordinal);
        Assert.Contains("\"مصر,\"\"القاهرة\"\"\nسطر\"", text, StringComparison.Ordinal);
        Assert.Contains(",-12.5,\r\n", text, StringComparison.Ordinal);
        Assert.EndsWith(",,,other\r\n", text, StringComparison.Ordinal);
    }

    [Fact]
    public void Excel_PreservesTypedScalarsAndArabicDirectionWithoutExecutingFormulas()
    {
        var data = new List<Dictionary<string, object>>
        {
            new() { ["رقم"] = JsonSerializer.Deserialize<JsonElement>("-12.5"), ["نشط"] = true, ["اسم"] = "=not-a-formula" }
        };
        var bytes = new ExportExcelService().ExportToExcelBytes(data, "Sheet1", "ar");
        using var book = new XLWorkbook(new MemoryStream(bytes));
        var sheet = book.Worksheet(1);
        Assert.True(sheet.RightToLeft);
        Assert.Equal(-12.5, sheet.Cell(2, 1).GetDouble());
        Assert.Equal(XLDataType.Number, sheet.Cell(2, 1).DataType);
        Assert.True(sheet.Cell(2, 2).GetBoolean());
        Assert.False(sheet.Cell(2, 3).HasFormula);
        Assert.Equal("=not-a-formula", sheet.Cell(2, 3).GetString());
    }

    [Fact]
    public void Csv_RejectsEmptyRatherThanGeneratingAnUnusableFile()
    {
        Assert.Throws<ArgumentException>(() => new ExportExcelService().ExportToCsvBytes([]));
    }
}
