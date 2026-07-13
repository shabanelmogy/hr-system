using System.Net.Http;
using System.Data;
using System.Collections.Generic;
using CrystalDecisions.CrystalReports.Engine;

namespace CrystalReportGeneratorApi.Helpers
{
    public static class CrystalReportFacade
    {
        public static HttpResponseMessage RenderReport(
            string reportPath,
            string reportFileName,
            string exportFilename,
            DataTable dataSource,
            string logoName = "Logo1.jpg",
            string lang = "ar")
        {
            return CrystalReport.CrystalReportRenderer.RenderReport(reportPath, reportFileName, exportFilename, dataSource, logoName, lang);
        }

        public static List<ReportInfo> GetReportTitlesInFolder(string subFolderPath, string reportCategory)
        {
            return CrystalReport.CrystalReportLister.GetReportTitlesInFolder(subFolderPath, reportCategory);
        }

        public static void AdjustReportDirection(ReportDocument reportDocument, string culture)
        {
            CrystalReport.CrystalReportDirection.AdjustReportDirection(reportDocument, culture);
        }

        public static string GetLocalizedPattern(string key, string lang)
        {
            return CrystalReport.CrystalReportInfo.GetLocalizedPattern(key, lang);
        }

        public static string GetReportTitle(ReportDocument reportDocument)
        {
            return CrystalReport.CrystalReportInfo.GetReportTitle(reportDocument);
        }

        public static string GetReportSubject(ReportDocument reportDocument)
        {
            return CrystalReport.CrystalReportInfo.GetReportSubject(reportDocument);
        }
    }
}
