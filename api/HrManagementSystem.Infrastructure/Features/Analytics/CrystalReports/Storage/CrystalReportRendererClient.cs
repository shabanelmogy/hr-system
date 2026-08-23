using System.Net;
using System.Net.Http.Headers;
using System.Text;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportRendererClient(
    HttpClient httpClient,
    IOptions<CrystalReportStorageOptions> options,
    ILogger<CrystalReportRendererClient> logger) : ICrystalReportRenderer
{
    public async Task<CrystalReportRenderResult> RenderAsync(
        CrystalReportRuntimeRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.InspectorBaseUrl))
        {
            logger.LogError("Crystal report runtime base URL is not configured.");
            return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
        }
        if (Encoding.UTF8.GetByteCount(request.DataXml) > settings.MaxRuntimeDataSizeBytes)
        {
            logger.LogWarning("Crystal report runtime data exceeded the configured limit.");
            return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
        }

        using var message = new HttpRequestMessage(HttpMethod.Post, "internal/reports/render");
        var apiKey = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            apiKey = settings.InspectorApiKey;
        if (!string.IsNullOrWhiteSpace(apiKey))
            message.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);

        using var multipart = new MultipartFormDataContent();
        using var content = new StreamContent(request.Content);
        content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        multipart.Add(content, "file", Path.GetFileName(request.OriginalFileName));
        multipart.Add(new StringContent(request.EntityKey), "entityKey");
        multipart.Add(new StringContent(request.ReportKey), "reportKey");
        multipart.Add(new StringContent(request.Language), "language");
        multipart.Add(new StringContent(request.DataXml, Encoding.UTF8, "application/xml"), "data");
        message.Content = multipart;

        try
        {
            using var response = await httpClient.SendAsync(
                message, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (response.StatusCode == HttpStatusCode.BadRequest)
                return Failure(CrystalReportRenderFailure.UnsupportedEntity);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Crystal report runtime returned HTTP {StatusCode} for entity {EntityKey}.",
                    (int)response.StatusCode, request.EntityKey);
                return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
            }

            var declaredLength = response.Content.Headers.ContentLength;
            if (declaredLength is > 0 && declaredLength > settings.MaxRenderedFileSizeBytes)
            {
                logger.LogWarning("Crystal report runtime returned an oversized PDF.");
                return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
            }

            var bytes = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            if (bytes.Length == 0 || bytes.LongLength > settings.MaxRenderedFileSizeBytes ||
                !HasPdfSignature(bytes))
            {
                logger.LogWarning("Crystal report runtime returned an invalid PDF response.");
                return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
            }

            var fileName = $"{request.ReportKey}.pdf";
            return new CrystalReportRenderResult(
                new CrystalReportDownload(
                    new MemoryStream(bytes, writable: false),
                    fileName,
                    "application/pdf",
                    bytes.LongLength),
                CrystalReportRenderFailure.None);
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Crystal report runtime is unavailable.");
            return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Crystal report runtime timed out.");
            return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
        }
    }

    private static bool HasPdfSignature(IReadOnlyList<byte> bytes) =>
        bytes.Count >= 5 && bytes[0] == '%' && bytes[1] == 'P' &&
        bytes[2] == 'D' && bytes[3] == 'F' && bytes[4] == '-';

    private static CrystalReportRenderResult Failure(CrystalReportRenderFailure failure) =>
        new(null, failure);
}
