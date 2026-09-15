using CrystalReportGeneratorApi.Filters;
using CrystalReportGeneratorApi.Runtime;
using CrystalReportGeneratorApi.Runtime.Rendering;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;

namespace CrystalReportGeneratorApi.Controllers
{
    [InternalApiKey]
    public sealed class InternalReportRenderController : ApiController
    {
        private static readonly Regex SafeKey = new Regex(
            "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);
        private readonly CrystalReportRenderService _renderService =
            new CrystalReportRenderService();

        [HttpPost]
        [Route("internal/reports/render")]
        public async Task<HttpResponseMessage> Render()
        {
            if (!Request.Content.IsMimeMultipartContent())
                return InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.UnsupportedMediaType,
                    InternalReportErrorCodes.InvalidRequest,
                    "A multipart Crystal report request is required.");

            using (var workspace = CrystalReportRequestWorkspace.Create("render"))
            {
                var provider = new MultipartFormDataStreamProvider(workspace.DirectoryPath);
                try
                {
                    await Request.Content.ReadAsMultipartAsync(provider);
                    if (provider.FileData.Count != 1)
                        return InternalReportResponseFactory.Create(
                            Request,
                            HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidRequest,
                            "Exactly one .rpt file is required.");

                    var upload = provider.FileData.Single();
                    var originalName = TrimQuotes(upload.Headers.ContentDisposition.FileName);
                    var file = new FileInfo(upload.LocalFileName);
                    if (!string.Equals(Path.GetExtension(originalName), ".rpt", StringComparison.OrdinalIgnoreCase) ||
                        !file.Exists || file.Length == 0 ||
                        file.Length > CrystalReportRuntimeSettings.MaximumReportFileSizeBytes)
                    return InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.BadRequest,
                        InternalReportErrorCodes.InvalidReport,
                        "The report source must be a valid .rpt file within the configured size limit.");

                    var entityKey = NormalizeKey(provider.FormData["entityKey"]);
                    var reportKey = NormalizeKey(provider.FormData["reportKey"]);
                    var language = (provider.FormData["language"] ?? string.Empty).Trim().ToLowerInvariant();
                    if (!SafeKey.IsMatch(entityKey) || !SafeKey.IsMatch(reportKey) ||
                        (language != "ar" && language != "en"))
                    return InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.BadRequest,
                        InternalReportErrorCodes.InvalidRequest,
                        "The report identity or language is invalid.");

                    var data = provider.FormData["data"];
                    if (string.IsNullOrWhiteSpace(data) ||
                    Encoding.UTF8.GetByteCount(data) > CrystalReportRuntimeSettings.MaximumRuntimeDataSizeBytes)
                    return InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.BadRequest,
                        InternalReportErrorCodes.InvalidRequest,
                        "The report data is missing or exceeds the configured size limit.");

                    using (var executionLease = await CrystalReportExecutionGate.TryEnterAsync())
                    {
                        if (executionLease == null)
                        {
                            CrystalRuntimeDiagnostics.Warning(Request, "render", InternalReportErrorCodes.Busy);
                            var busy = InternalReportResponseFactory.Create(
                                Request,
                                HttpStatusCode.ServiceUnavailable,
                                InternalReportErrorCodes.Busy,
                                "The Crystal report runtime is busy. Retry the request shortly.");
                            busy.Headers.RetryAfter = new RetryConditionHeaderValue(TimeSpan.FromSeconds(1));
                            return busy;
                        }

                        var rendered = _renderService.Render(
                            file.FullName, entityKey, reportKey, language, data);
                        var response = Request.CreateResponse(HttpStatusCode.OK);
                        response.Content = new ByteArrayContent(rendered.Content);
                        response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
                        response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline")
                        {
                            FileName = rendered.FileName
                        };
                        CrystalRuntimeDiagnostics.Information(Request, "render", "success");
                        return response;
                    }
                }
                catch (UnsupportedCrystalReportProfileException exception)
                {
                    CrystalRuntimeDiagnostics.Warning(
                        Request,
                        "render",
                        InternalReportErrorCodes.UnsupportedProfile,
                        exception);
                    return InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.BadRequest,
                        InternalReportErrorCodes.UnsupportedProfile,
                        exception.Message);
                }
                catch (Exception exception)
                {
                    CrystalRuntimeDiagnostics.Error(Request, "render", InternalReportErrorCodes.RenderFailed, exception);
                    return InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.InternalServerError,
                        InternalReportErrorCodes.RenderFailed,
                        "The Crystal report could not be rendered.");
                }
            }
        }

        private static string NormalizeKey(string value) =>
            (value ?? string.Empty).Trim().ToLowerInvariant();

        private static string TrimQuotes(string value) =>
            string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().Trim('"');

    }
}
