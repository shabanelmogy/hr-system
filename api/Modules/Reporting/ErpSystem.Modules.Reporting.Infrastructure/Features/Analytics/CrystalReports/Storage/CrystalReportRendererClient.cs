using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportRendererClient(
    HttpClient httpClient,
    IOptions<CrystalReportStorageOptions> options,
    ICurrentExecutionContext executionContext,
    ILogger<CrystalReportRendererClient> logger) : ICrystalReportRenderer
{
    public async Task<CrystalReportRenderResult> RenderAsync(
        CrystalReportRuntimeRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (!settings.RuntimeEnabled)
        {
            logger.LogDebug("Crystal report runtime integration is disabled.");
            return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
        }
        if (string.IsNullOrWhiteSpace(settings.RuntimeBaseUrl))
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
            apiKey = settings.RuntimeApiKey;
        if (!string.IsNullOrWhiteSpace(apiKey))
            message.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);
        if (!string.IsNullOrWhiteSpace(executionContext.CorrelationId))
            message.Headers.TryAddWithoutValidation(
                ExecutionContextHeaderNames.CorrelationId,
                executionContext.CorrelationId);

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
            if (!response.IsSuccessStatusCode)
            {
                var runtimeErrorCode = await ReadRuntimeErrorCodeAsync(
                    response,
                    settings.MaxInspectionResponseSizeBytes,
                    cancellationToken);
                logger.LogWarning(
                    "Crystal report runtime returned HTTP {StatusCode} with code {RuntimeCode} for entity {EntityKey}.",
                    (int)response.StatusCode, runtimeErrorCode, request.EntityKey);
                if (response.StatusCode == HttpStatusCode.BadRequest)
                {
                    return Failure(string.Equals(
                        runtimeErrorCode,
                        "crystal_runtime_unsupported_profile",
                        StringComparison.Ordinal)
                            ? CrystalReportRenderFailure.UnsupportedEntity
                            : CrystalReportRenderFailure.InvalidReport);
                }
                return Failure(CrystalReportRenderFailure.RuntimeUnavailable);
            }

            var bytes = await BoundedHttpContentReader.ReadAsync(
                response.Content,
                settings.MaxRenderedFileSizeBytes,
                cancellationToken);
            if (bytes is null || bytes.Length == 0 || !HasPdfSignature(bytes))
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

    private static async Task<string?> ReadRuntimeErrorCodeAsync(
        HttpResponseMessage response,
        long maximumBytes,
        CancellationToken cancellationToken)
    {
        try
        {
            var payload = await BoundedHttpContentReader.ReadAsync(
                response.Content,
                Math.Min(maximumBytes, 64 * 1024),
                cancellationToken);
            if (payload is null || payload.Length == 0)
                return null;

            return JsonSerializer.Deserialize<RuntimeErrorResponse>(
                payload,
                RuntimeErrorJsonOptions)?.Code;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private sealed record RuntimeErrorResponse(string? Code);
    private static readonly JsonSerializerOptions RuntimeErrorJsonOptions =
        new(JsonSerializerDefaults.Web);

    private static CrystalReportRenderResult Failure(CrystalReportRenderFailure failure) =>
        new(null, failure);
}
