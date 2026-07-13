namespace HrManagementSystem.Features.Analytics.Exporting.Services
{
    public interface IExportPdfFileService
    {
        byte[] CreatePDF(List<Dictionary<string, object>> forecasts, string fileName, string reportHead, string culture);
    }
}
