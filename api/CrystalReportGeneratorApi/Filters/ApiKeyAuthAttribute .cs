using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace CrystalReportGeneratorApi.Filters
{
    public class ApiKeyAuthAttribute : ActionFilterAttribute
    {
        private const string ApiKeyHeaderName = "X-APIKey";

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            // التأكد من وجود الـ API Key في الـ headers
            if (!actionContext.Request.Headers.Contains(ApiKeyHeaderName))
            {
                actionContext.Response = actionContext.Request.CreateErrorResponse(
                    HttpStatusCode.Unauthorized,
                    "API key is missing");
                return;
            }

            var apiKey = actionContext.Request.Headers.GetValues(ApiKeyHeaderName).FirstOrDefault();
            var origin = actionContext.Request.Headers.Referrer?.GetLeftPart(UriPartial.Authority);

            // التأكد من وجود الـ API Key والـ Origin والتأكد من صحتهم
            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(origin) || !IsValidApiKey(apiKey, origin))
            {
                actionContext.Response = actionContext.Request.CreateErrorResponse(
                    HttpStatusCode.Unauthorized,
                    "Invalid or expired API key or origin");
                return;
            }

            base.OnActionExecuting(actionContext);
        }

        private bool IsValidApiKey(string apiKey, string origin)
        {
            var connectionString = ConfigurationManager.ConnectionStrings["DbConnectionString"].ConnectionString;

            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();

                var apiKeyHash = BitConverter.ToString(
                        SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(apiKey)))
                    .Replace("-", string.Empty);

                var query = @"
            SELECT COUNT(*) 
            FROM ApiKeys 
            WHERE KeyHash = @ApiKeyHash
              AND ClientUri = @Origin 
              AND IsActive = 1
              AND RevokedAt IS NULL
              AND (ExpiresAt IS NULL OR ExpiresAt > GETUTCDATE())";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@ApiKeyHash", apiKeyHash);
                    command.Parameters.AddWithValue("@Origin", origin);

                    var result = (int)command.ExecuteScalar();
                    return result > 0; // إذا كانت النتيجة أكبر من 0 معناها الـ API Key صحيح وفعال
                }
            }
        }

    }
}
