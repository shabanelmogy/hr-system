using System;
using System.Data;
using System.IO;
using System.Net;
using System.Net.Http;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class CrystalReportRenderer
    {
        public static HttpResponseMessage RenderReport(
            string reportPath,
            string reportFileName,
            string exportFilename,
            DataTable dataSource,
            string logoName = "Logo1.jpg",
            string lang = "ar")
        {
            try
            {
                var reportDocument = CrystalReportLoader.LoadReportDocument(reportPath, reportFileName, out string fullReportPath);
                string imagePath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/ReportsLogo"), logoName);
                CrystalReportFormulas.AddOrUpdateFormulas(reportDocument, imagePath, lang);

                reportDocument.SetDataSource(dataSource);

                CrystalReportDirection.AdjustReportDirection(reportDocument, lang);


                return CrystalReportExporter.ExportReportAsPdf(reportDocument, exportFilename);
            }
            catch (Exception ex)
            {
                return new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent($"Error generating report: {ex.Message}")
                };
            }
        }
    }
}