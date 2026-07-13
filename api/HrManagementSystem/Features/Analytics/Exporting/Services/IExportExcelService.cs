namespace HrManagementSystem.Features.Analytics.Exporting.Services
{
    public interface IExportExcelService
    {
        byte[] ExportToExcelBytes(List<Dictionary<string, object>> data, string sheetName, string culture);

        byte[] ExportToCsvBytes(List<Dictionary<string, object>> data);
    }
}
