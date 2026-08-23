using CrystalReportGeneratorApi.Filters;
using CrystalReportGeneratorApi.Helpers.CrystalReport;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;

namespace CrystalReportGeneratorApi.Controllers
{
    [InternalApiKey]
    public sealed class InternalReportRenderController : ApiController
    {
        private const long MaximumReportSizeBytes = 10L * 1024L * 1024L;
        private const int MaximumDataSizeBytes = 10 * 1024 * 1024;
        private static readonly Regex SafeKey = new Regex(
            "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);

        [HttpPost]
        [Route("internal/reports/render")]
        public async Task<HttpResponseMessage> Render()
        {
            if (!Request.Content.IsMimeMultipartContent())
                return Request.CreateErrorResponse(
                    HttpStatusCode.UnsupportedMediaType,
                    "A multipart Crystal report request is required.");

            var workingDirectory = Path.Combine(Path.GetTempPath(), "hrms-crystal-render");
            Directory.CreateDirectory(workingDirectory);
            var provider = new MultipartFormDataStreamProvider(workingDirectory);

            try
            {
                await Request.Content.ReadAsMultipartAsync(provider);
                if (provider.FileData.Count != 1)
                    return Request.CreateErrorResponse(
                        HttpStatusCode.BadRequest,
                        "Exactly one .rpt file is required.");

                var upload = provider.FileData.Single();
                var originalName = TrimQuotes(upload.Headers.ContentDisposition.FileName);
                var file = new FileInfo(upload.LocalFileName);
                if (!string.Equals(Path.GetExtension(originalName), ".rpt", StringComparison.OrdinalIgnoreCase) ||
                    !file.Exists || file.Length == 0 || file.Length > MaximumReportSizeBytes)
                    return Request.CreateErrorResponse(
                        HttpStatusCode.BadRequest,
                        "The report source must be a valid .rpt file up to 10 MiB.");

                var entityKey = NormalizeKey(provider.FormData["entityKey"]);
                var reportKey = NormalizeKey(provider.FormData["reportKey"]);
                var language = (provider.FormData["language"] ?? string.Empty).Trim().ToLowerInvariant();
                if (!SafeKey.IsMatch(entityKey) || !SafeKey.IsMatch(reportKey) ||
                    (language != "ar" && language != "en"))
                    return Request.CreateErrorResponse(
                        HttpStatusCode.BadRequest,
                        "The report identity or language is invalid.");

                var data = provider.FormData["data"];
                if (string.IsNullOrWhiteSpace(data) ||
                    Encoding.UTF8.GetByteCount(data) > MaximumDataSizeBytes)
                    return Request.CreateErrorResponse(
                        HttpStatusCode.BadRequest,
                        "The report data is missing or exceeds 10 MiB.");

                return ManagedReportRuntime.Render(
                    file.FullName, entityKey, reportKey, language, data);
            }
            catch (UnsupportedManagedReportException exception)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, exception.Message);
            }
            catch (Exception)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.InternalServerError,
                    "The Crystal report could not be rendered.");
            }
            finally
            {
                foreach (var item in provider.FileData)
                    TryDelete(item.LocalFileName);
            }
        }

        private static string NormalizeKey(string value) =>
            (value ?? string.Empty).Trim().ToLowerInvariant();

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
                // The host's temporary-file cleanup remains a secondary safeguard.
            }
        }
    }
}
