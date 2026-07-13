using System.Data;
using ClosedXML.Excel;

namespace HrManagementSystem.Features.Analytics.Exporting.Services
{
    public class ExportExcelService : IExportExcelService
    {
        public byte[] ExportToExcelBytes(List<Dictionary<string, object>> data, string sheetName, string culture)
        {
            using var workbook = new XLWorkbook();
            DataTable dataTable = ListToDataTable(data);

            var worksheet = workbook.Worksheets.Add(dataTable, sheetName);
            worksheet.Columns().AdjustToContents();
            worksheet.SheetView.Freeze(1, 1);

            // Set text alignment based on culture
            var alignment = culture == "ar"
                            ? XLAlignmentHorizontalValues.Right
                            : XLAlignmentHorizontalValues.Left;

            worksheet.Cells().Style.Alignment.Horizontal = alignment;

            if (culture == "ar")
            {
                worksheet.SetRightToLeft();
            }

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }

        private static DataTable ListToDataTable(List<Dictionary<string, object>> list)
        {
            if (list == null || list.Count == 0)
            {
                throw new ArgumentNullException(nameof(list));
            }

            DataTable dataTable = new();

            foreach (var dict in list)
            {
                foreach (var key in dict.Keys)
                {
                    if (!dataTable.Columns.Contains(key))
                    {
                        dataTable.Columns.Add(key);
                    }
                }
            }

            foreach (var dict in list)
            {
                DataRow row = dataTable.NewRow();
                foreach (var key in dict.Keys)
                {
                    row[key] = dict[key] ?? DBNull.Value;
                }
                dataTable.Rows.Add(row);
            }

            return dataTable;
        }

        public byte[] ExportToCsvBytes(List<Dictionary<string, object>> data)
        {
            if (data == null || data.Count == 0)
            {
                throw new ArgumentException("Data cannot be null or empty.", nameof(data));
            }

            var csvContent = ConvertToCsv(data);
            return Encoding.UTF8.GetBytes(csvContent);
        }

        private string ConvertToCsv(List<Dictionary<string, object>> data)
        {
            var sb = new StringBuilder();

            // Get column names from the keys of the first dictionary
            var columnNames = data.First().Keys.ToList();

            // Writing the header
            sb.AppendLine(string.Join(",", columnNames));

            // Writing the data
            foreach (var row in data)
            {
                var values = columnNames.Select(column => row.TryGetValue(column, out var value) ? value?.ToString() ?? string.Empty : string.Empty);
                sb.AppendLine(string.Join(",", values));
            }

            return sb.ToString();
        }
    }
}
