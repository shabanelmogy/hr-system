using ClosedXML.Excel;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting.Services;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Exporting.Services;

public sealed class ExportExcelService : IExportExcelService
{
    public byte[] ExportToExcelBytes(List<Dictionary<string, object>> data, string sheetName, string culture)
    {
        EnsureData(data);
        var columns = Columns(data);
        using var book = new XLWorkbook();
        var sheet = book.Worksheets.Add(sheetName);
        for (var index = 0; index < columns.Length; index++)
            sheet.Cell(1, index + 1).Value = columns[index];
        for (var index = 0; index < data.Count; index++)
            for (var column = 0; column < columns.Length; column++)
                if (data[index].TryGetValue(columns[column], out var value))
                    sheet.Cell(index + 2, column + 1).Value =
                        XLCellValue.FromObject(TabularExportData.Normalize(value), CultureInfo.InvariantCulture);
        sheet.Range(1, 1, data.Count + 1, columns.Length).CreateTable();
        sheet.Columns().AdjustToContents(1, Math.Min(201, data.Count + 1));
        foreach (var column in sheet.ColumnsUsed())
            column.Width = Math.Clamp(column.Width, 8, 60);
        sheet.SheetView.Freeze(1, 1);
        sheet.Cells().Style.Alignment.Horizontal = culture == "ar"
            ? XLAlignmentHorizontalValues.Right : XLAlignmentHorizontalValues.Left;
        if (culture == "ar")
            sheet.SetRightToLeft();
        using var stream = new MemoryStream();
        book.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportToCsvBytes(List<Dictionary<string, object>> data)
    {
        EnsureData(data);
        var columns = Columns(data);
        var csv = new StringBuilder("\uFEFF");
        csv.AppendJoin(',', columns.Select(column => EscapeCsv(ProtectText(column)))).Append("\r\n");
        foreach (var row in data)
        {
            csv.AppendJoin(',', columns.Select(column => row.TryGetValue(column, out var value)
                ? EscapeCsv(CsvValue(TabularExportData.Normalize(value))) : string.Empty));
            csv.Append("\r\n");
        }
        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private static string[] Columns(List<Dictionary<string, object>> data) =>
        data.SelectMany(row => row.Keys).Distinct(StringComparer.Ordinal).ToArray();

    private static void EnsureData(List<Dictionary<string, object>> data)
    {
        if (!TabularExportData.IsValid(data))
            throw new ArgumentException("Export requires a bounded table of scalar values.", nameof(data));
    }

    private static string CsvValue(object? value) => value switch
    {
        null => string.Empty,
        string text => ProtectText(text),
        bool boolean => boolean ? "true" : "false",
        _ => Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty
    };

    private static string ProtectText(string value)
    {
        var marker = value.FirstOrDefault(character => !char.IsWhiteSpace(character) && !char.IsControl(character));
        return marker is '=' or '+' or '-' or '@' ? "'" + value : value;
    }

    private static string EscapeCsv(string value) => value.IndexOfAny([',', '"', '\r', '\n']) >= 0
        ? '"' + value.Replace("\"", "\"\"", StringComparison.Ordinal) + '"' : value;
}
