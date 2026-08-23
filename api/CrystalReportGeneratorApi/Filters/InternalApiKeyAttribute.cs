using System;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

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
        private const string RequireSettingName = "RequireInternalApiKey";

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            var expected = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY")
                ?? ConfigurationManager.AppSettings[SettingName];
            var supplied = actionContext.Request.Headers.Contains(HeaderName)
                ? actionContext.Request.Headers.GetValues(HeaderName).FirstOrDefault()
                : null;

            if (string.IsNullOrWhiteSpace(expected))
            {
                var requireKey = bool.TryParse(
                    ConfigurationManager.AppSettings[RequireSettingName],
                    out var configuredRequireKey) && configuredRequireKey;
                if (requireKey)
                {
                    actionContext.Response = actionContext.Request.CreateErrorResponse(
                        HttpStatusCode.ServiceUnavailable,
                        "The internal Crystal Report API key is required but not configured.");
                    return;
                }

                base.OnActionExecuting(actionContext);
                return;
            }

            if (string.IsNullOrWhiteSpace(supplied) || !FixedTimeEquals(expected, supplied))
            {
                actionContext.Response = actionContext.Request.CreateErrorResponse(
                    HttpStatusCode.Unauthorized,
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
