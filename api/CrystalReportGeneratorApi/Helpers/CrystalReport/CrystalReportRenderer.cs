using System;
using System.Data;
using System.IO;
using System.Net;
using System.Net.Http;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;

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
                using (var reportDocument = CrystalReportLoader.LoadReportDocument(
                    reportPath, reportFileName, out string fullReportPath))
                {
                    return RenderLoadedReport(
                        reportDocument, exportFilename, dataSource, logoName, lang);
                }
            }
            catch (Exception ex)
            {
                return new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent($"Error generating report: {ex.Message}")
                };
            }
        }

        public static HttpResponseMessage RenderReportFile(
            string fullReportPath,
            string exportFilename,
            DataTable dataSource,
            string logoName = "Logo1.jpg",
            string lang = "ar")
        {
            try
            {
                using (var reportDocument = new ReportDocument())
                {
                    reportDocument.Load(fullReportPath, OpenReportMethod.OpenReportByTempCopy);
                    return RenderLoadedReport(
                        reportDocument, exportFilename, dataSource, logoName, lang);
                }
            }
            catch (Exception ex)
            {
                return new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent($"Error generating report: {ex.Message}")
                };
            }
        }

        private static HttpResponseMessage RenderLoadedReport(
            ReportDocument reportDocument,
            string exportFilename,
            DataTable dataSource,
            string logoName,
            string lang)
        {
            var imagePath = Path.Combine(
                System.Web.Hosting.HostingEnvironment.MapPath("~/ReportsLogo"),
                logoName);
            CrystalReportFormulas.AddOrUpdateFormulas(reportDocument, imagePath, lang);
            reportDocument.SetDataSource(dataSource);
            CrystalReportDirection.AdjustReportDirection(reportDocument, lang);
            return CrystalReportExporter.ExportReportAsPdf(reportDocument, exportFilename);
        }
    }
}
