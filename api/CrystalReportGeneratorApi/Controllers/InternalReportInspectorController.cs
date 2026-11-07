using CrystalReportGeneratorApi.Runtime;
using CrystalReportGeneratorApi.Runtime.Inspection;
using CrystalReportGeneratorApi.Runtime.Rendering;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Text.RegularExpressions;

namespace CrystalReportGeneratorApi.Controllers
{
    public sealed class InternalReportInspectorController : ApiController
    {
        private static readonly Regex SafeEntityKey = new Regex(
            "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);
        private readonly CrystalReportInspectionService _inspectionService =
            new CrystalReportInspectionService();

        [HttpPost]
        [Route("internal/reports/inspect")]
        public async Task<IHttpActionResult> Inspect()
        {
            if (!Request.Content.IsMimeMultipartContent())
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.UnsupportedMediaType,
                    InternalReportErrorCodes.InvalidRequest,
                    "A multipart .rpt file is required."));

            using (var workspace = CrystalReportRequestWorkspace.Create("inspection"))
            {
                var provider = new MultipartFormDataStreamProvider(workspace.DirectoryPath);
                try
                {
                    await Request.Content.ReadAsMultipartAsync(provider);
                    if (provider.FileData.Count != 1)
                        return ResponseMessage(InternalReportResponseFactory.Create(
                            Request,
                            HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidRequest,
                            "Exactly one .rpt file is required."));

                    var uploaded = provider.FileData.Single();
                    var originalName = TrimQuotes(uploaded.Headers.ContentDisposition.FileName);
                    if (!string.Equals(Path.GetExtension(originalName), ".rpt", StringComparison.OrdinalIgnoreCase))
                        return ResponseMessage(InternalReportResponseFactory.Create(
                            Request,
                            HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidReport,
                            "Only Crystal Report .rpt files are accepted."));

                    var file = new FileInfo(uploaded.LocalFileName);
                    if (!file.Exists || file.Length == 0 ||
                        file.Length > CrystalReportRuntimeSettings.MaximumReportFileSizeBytes)
                        return ResponseMessage(InternalReportResponseFactory.Create(
                            Request,
                            HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidReport,
                            "The Crystal Report file exceeds the configured size limit."));

                    var entityKey = (provider.FormData["entityKey"] ?? string.Empty)
                        .Trim()
                        .ToLowerInvariant();
                    if (entityKey.Length > 64 || !SafeEntityKey.IsMatch(entityKey))
                        return ResponseMessage(InternalReportResponseFactory.Create(
                            Request,
                            HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidRequest,
                            "A canonical managed report entity key is required."));

                    using (var executionLease = await CrystalReportExecutionGate.TryEnterAsync())
                    {
                        if (executionLease == null)
                        {
                            CrystalRuntimeDiagnostics.Warning(Request, "inspect", InternalReportErrorCodes.Busy);
                            return ResponseMessage(InternalReportResponseFactory.Create(
                                Request,
                                HttpStatusCode.ServiceUnavailable,
                                InternalReportErrorCodes.Busy,
                                "The Crystal report runtime is busy. Retry the request shortly."));
                        }

                        var inspection = _inspectionService.Inspect(file.FullName, entityKey);
                        CrystalRuntimeDiagnostics.Information(Request, "inspect", "success");
                        return Ok(inspection);
                    }
                }
                catch (CrystalReportRejectedException exception)
                {
                    CrystalRuntimeDiagnostics.Warning(Request, "inspect", InternalReportErrorCodes.InvalidReport, exception);
                    return ResponseMessage(InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.BadRequest,
                        exception.Code,
                        exception.Message));
                }
                catch (UnsupportedCrystalReportProfileException exception)
                {
                    CrystalRuntimeDiagnostics.Warning(
                        Request,
                        "inspect",
                        InternalReportErrorCodes.UnsupportedProfile,
                        exception);
                    return ResponseMessage(InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.BadRequest,
                        InternalReportErrorCodes.UnsupportedProfile,
                        exception.Message));
                }
                catch (Exception exception)
                {
                    CrystalRuntimeDiagnostics.Error(Request, "inspect", InternalReportErrorCodes.InvalidReport, exception);
                    return ResponseMessage(InternalReportResponseFactory.Create(
                        Request,
                        HttpStatusCode.BadRequest,
                        InternalReportErrorCodes.InvalidReport,
                        "The uploaded file could not be opened as a supported Crystal Report."));
                }
            }
        }

        [HttpPost]
        [Route("internal/reports/verify-database")]
        public async Task<IHttpActionResult> VerifyDatabase()
        {
            if (!Request.Content.IsMimeMultipartContent())
                return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.UnsupportedMediaType,
                    InternalReportErrorCodes.InvalidRequest, "A multipart .rpt file is required."));

            using (var workspace = CrystalReportRequestWorkspace.Create("verify-database"))
            {
                var provider = new MultipartFormDataStreamProvider(workspace.DirectoryPath);
                try
                {
                    await Request.Content.ReadAsMultipartAsync(provider);
                    if (provider.FileData.Count != 1)
                        return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidRequest, "Exactly one .rpt file is required."));

                    var uploaded = provider.FileData.Single();
                    var originalName = TrimQuotes(uploaded.Headers.ContentDisposition.FileName);
                    if (!string.Equals(Path.GetExtension(originalName), ".rpt", StringComparison.OrdinalIgnoreCase))
                        return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidReport, "Only Crystal Report .rpt files are accepted."));

                    var file = new FileInfo(uploaded.LocalFileName);
                    if (!file.Exists || file.Length == 0 || file.Length > CrystalReportRuntimeSettings.MaximumReportFileSizeBytes)
                        return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidReport, "The Crystal Report file exceeds the configured size limit."));

                    var entityKey = (provider.FormData["entityKey"] ?? string.Empty).Trim().ToLowerInvariant();
                    if (entityKey.Length > 64 || !SafeEntityKey.IsMatch(entityKey))
                        return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.BadRequest,
                            InternalReportErrorCodes.InvalidRequest, "A canonical managed report entity key is required."));

                    using (var executionLease = await CrystalReportExecutionGate.TryEnterAsync())
                    {
                        if (executionLease == null)
                            return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.ServiceUnavailable,
                                InternalReportErrorCodes.Busy, "The Crystal report runtime is busy. Retry the request shortly."));

                        var outputPath = Path.Combine(workspace.DirectoryPath, "verified.rpt");
                        var result = _inspectionService.VerifyDatabase(file.FullName, outputPath, entityKey);
                        if (!result.IsValid)
                            return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.BadRequest,
                                InternalReportErrorCodes.SchemaMismatch, "The verified report does not match the managed contract."));

                        var bytes = File.ReadAllBytes(outputPath);
                        var response = Request.CreateResponse(HttpStatusCode.OK);
                        response.Content = new ByteArrayContent(bytes);
                        response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = Path.GetFileNameWithoutExtension(originalName) + "-verified.rpt"
                        };
                        response.Headers.Add("X-Crystal-Contract-Schema", result.ContractSchemaVersion.ToString());
                        response.Headers.Add("X-Crystal-Contract-Fingerprint", result.ContractFingerprint);
                        CrystalRuntimeDiagnostics.Information(Request, "verify-database", "success");
                        return ResponseMessage(response);
                    }
                }
                catch (CrystalReportRejectedException exception)
                {
                    CrystalRuntimeDiagnostics.Warning(Request, "verify-database", exception.Code, exception);
                    return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.BadRequest,
                        exception.Code, exception.Message));
                }
                catch (Exception exception)
                {
                    CrystalRuntimeDiagnostics.Error(Request, "verify-database", InternalReportErrorCodes.InvalidReport, exception);
                    return ResponseMessage(InternalReportResponseFactory.Create(Request, HttpStatusCode.BadRequest,
                        InternalReportErrorCodes.InvalidReport, "Crystal could not verify the stored report database."));
                }
            }
        }

        private static string TrimQuotes(string value) =>
            string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().Trim('"');

    }
}
