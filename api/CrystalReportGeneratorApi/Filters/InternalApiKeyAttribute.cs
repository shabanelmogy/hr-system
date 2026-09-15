using System;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using CrystalReportGeneratorApi.Runtime;

namespace CrystalReportGeneratorApi.Filters
{
    /// <summary>
    /// Protects service-to-service endpoints with a deployment-owned secret.
    /// Unlike the browser API-key filter, this filter intentionally does not
    /// depend on an Origin or Referrer header.
    /// </summary>
    public sealed class InternalApiKeyAttribute : ActionFilterAttribute
    {
        private const string HeaderName = "X-Internal-Api-Key";
        private const string SettingName = "InternalApiKey";

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            var expected = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY")
                ?? ConfigurationManager.AppSettings[SettingName];

            if (string.IsNullOrWhiteSpace(expected))
            {
                CrystalRuntimeDiagnostics.Error(
                    actionContext.Request,
                    "authentication",
                    InternalReportErrorCodes.ApiKeyNotConfigured);
                actionContext.Response = InternalReportResponseFactory.Create(
                    actionContext.Request,
                    HttpStatusCode.ServiceUnavailable,
                    InternalReportErrorCodes.ApiKeyNotConfigured,
                    "The internal Crystal Report API key is not configured.");
                return;
            }

            string supplied = null;
            if (actionContext.Request.Headers.TryGetValues(HeaderName, out var suppliedValues))
            {
                var values = suppliedValues.Take(2).ToArray();
                if (values.Length == 1)
                    supplied = values[0];
            }

            if (string.IsNullOrWhiteSpace(supplied) || !FixedTimeEquals(expected, supplied))
            {
                CrystalRuntimeDiagnostics.Warning(
                    actionContext.Request,
                    "authentication",
                    InternalReportErrorCodes.Unauthorized);
                actionContext.Response = InternalReportResponseFactory.Create(
                    actionContext.Request,
                    HttpStatusCode.Unauthorized,
                    InternalReportErrorCodes.Unauthorized,
                    "Invalid internal API key.");
                return;
            }

            base.OnActionExecuting(actionContext);
        }

        private static bool FixedTimeEquals(string expected, string supplied)
        {
            byte[] expectedHash;
            byte[] suppliedHash;

            using (var sha256 = SHA256.Create())
            {
                expectedHash = sha256.ComputeHash(Encoding.UTF8.GetBytes(expected));
                suppliedHash = sha256.ComputeHash(Encoding.UTF8.GetBytes(supplied));
            }

            var difference = 0;
            for (var index = 0; index < expectedHash.Length; index++)
                difference |= expectedHash[index] ^ suppliedHash[index];

            return difference == 0;
        }
    }
}
