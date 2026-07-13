using CrystalDecisions.CrystalReports.Engine;
using System.IO;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class CrystalReportLoader
    {
        public static ReportDocument LoadReportDocument(string reportPath, string reportFileName, out string fullReportPath)
        {
            var reportDocument = new ReportDocument();
            fullReportPath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(reportPath), reportFileName);
            reportDocument.Load(fullReportPath);
            return reportDocument;
        }
    }
}