using System.Net;
using System.Net.Http;

namespace CrystalReportGeneratorApi.Runtime
{
    internal sealed class InternalReportError
    {
        public InternalReportError(string code, string message)
        {
            Code = code;
            Message = message;
        }

        public string Code { get; private set; }
        public string Message { get; private set; }
    }

    internal static class InternalReportErrorCodes
    {
        public const string ApiKeyNotConfigured = "crystal_runtime_api_key_not_configured";
        public const string Unauthorized = "crystal_runtime_unauthorized";
        public const string InvalidRequest = "crystal_runtime_invalid_request";
        public const string InvalidReport = "crystal_runtime_invalid_report";
        public const string Busy = "crystal_runtime_busy";
        public const string UnsupportedProfile = "crystal_runtime_unsupported_profile";
        public const string RenderFailed = "crystal_runtime_render_failed";
        public const string CatalogNotFound = "crystal_runtime_catalog_not_found";
        public const string CatalogConflict = "crystal_runtime_catalog_conflict";
        public const string CatalogUnavailable = "crystal_runtime_catalog_unavailable";
    }

    internal static class InternalReportResponseFactory
    {
        public static HttpResponseMessage Create(
            HttpRequestMessage request,
            HttpStatusCode statusCode,
            string code,
            string message) =>
            request.CreateResponse(statusCode, new InternalReportError(code, message));
    }
}
