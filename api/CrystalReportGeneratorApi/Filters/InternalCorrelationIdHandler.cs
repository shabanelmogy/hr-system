using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace CrystalReportGeneratorApi.Filters
{
    public sealed class InternalCorrelationIdHandler : DelegatingHandler
    {
        private const string HeaderName = "X-Correlation-ID";

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            string supplied = null;
            if (request.Headers.Contains(HeaderName))
            {
                var suppliedValues = request.Headers.GetValues(HeaderName).Take(2).ToArray();
                if (suppliedValues.Length == 1)
                    supplied = suppliedValues[0];
            }
            var correlationId = IsValid(supplied)
                ? supplied
                : Guid.NewGuid().ToString("N");

            // Canonicalize the request header so controllers and diagnostics observe
            // exactly the same correlation id that will be returned to the caller.
            request.Headers.Remove(HeaderName);
            request.Headers.TryAddWithoutValidation(HeaderName, correlationId);

            var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
            response.Headers.Remove(HeaderName);
            response.Headers.TryAddWithoutValidation(HeaderName, correlationId);
            return response;
        }

        private static bool IsValid(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Length > 128)
                return false;

            return value.All(character =>
                ((character >= 'a' && character <= 'z') ||
                 (character >= 'A' && character <= 'Z') ||
                 (character >= '0' && character <= '9')) || character == '-' ||
                character == '_' || character == '.');
        }
    }
}
