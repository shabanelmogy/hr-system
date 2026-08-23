using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportGeneratorApi.Filters;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CrystalReportGeneratorApi.Controllers
{
    [InternalApiKey]
    public sealed class InternalReportInspectorController : ApiController
    {
        private const long MaximumReportSizeBytes = 10L * 1024L * 1024L;

        [HttpPost]
        [Route("internal/reports/inspect")]
        public async Task<IHttpActionResult> Inspect()
        {
            if (!Request.Content.IsMimeMultipartContent())
                return Content(HttpStatusCode.UnsupportedMediaType, "A multipart .rpt file is required.");

            var quarantineDirectory = Path.Combine(Path.GetTempPath(), "hrms-crystal-inspection");
            Directory.CreateDirectory(quarantineDirectory);

            var provider = new MultipartFormDataStreamProvider(quarantineDirectory);

            try
            {
                await Request.Content.ReadAsMultipartAsync(provider);
                if (provider.FileData.Count != 1)
                    return BadRequest("Exactly one .rpt file is required.");

                var uploaded = provider.FileData.Single();
                var originalName = TrimQuotes(uploaded.Headers.ContentDisposition.FileName);
                if (!string.Equals(Path.GetExtension(originalName), ".rpt", StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Only Crystal Report .rpt files are accepted.");

                var file = new FileInfo(uploaded.LocalFileName);
                if (!file.Exists || file.Length == 0 || file.Length > MaximumReportSizeBytes)
                    return BadRequest("The Crystal Report file must be between 1 byte and 10 MiB.");

                using (var report = new ReportDocument())
                {
                    report.Load(file.FullName, OpenReportMethod.OpenReportByTempCopy);

                    var documents = new List<ReportDocument> { report };
                    documents.AddRange(report.Subreports.Cast<ReportDocument>());

                    if (documents.Any(document => document.HasSavedData))
                        return BadRequest("Crystal Report files containing saved data are not accepted.");

                    if (documents.Any(HasEmbeddedPassword))
                        return BadRequest("Crystal Report files containing embedded database passwords are not accepted.");

                    var title = NormalizeSummary(report.SummaryInfo == null
                        ? null
                        : report.SummaryInfo.ReportTitle);
                    var subject = NormalizeSummary(report.SummaryInfo == null
                        ? null
                        : report.SummaryInfo.ReportSubject);

                    return Ok(new
                    {
                        IsValid = true,
                        Title = title,
                        Subject = subject,
                        HasSavedData = false,
                        HasEmbeddedCredentials = false,
                        SubreportCount = report.Subreports.Count
                    });
                }
            }
            catch (Exception)
            {
                return BadRequest("The uploaded file could not be opened as a supported Crystal Report.");
            }
            finally
            {
                foreach (var item in provider.FileData)
                    TryDelete(item.LocalFileName);
            }
        }

        private static bool HasEmbeddedPassword(ReportDocument report)
        {
            foreach (Table table in report.Database.Tables)
            {
                var connection = table.LogOnInfo == null ? null : table.LogOnInfo.ConnectionInfo;
                if (connection != null && !string.IsNullOrWhiteSpace(connection.Password))
                    return true;
            }

            return false;
        }

        private static string NormalizeSummary(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var normalized = new string(value.Where(character => !char.IsControl(character)).ToArray()).Trim();
            return normalized.Length <= 200 ? normalized : normalized.Substring(0, 200);
        }

        private static string TrimQuotes(string value) =>
            string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().Trim('"');

        private static void TryDelete(string path)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
                    File.Delete(path);
            }
            catch
            {
                // Best-effort quarantine cleanup; hosting cleanup remains a secondary safeguard.
            }
        }
    }
}
