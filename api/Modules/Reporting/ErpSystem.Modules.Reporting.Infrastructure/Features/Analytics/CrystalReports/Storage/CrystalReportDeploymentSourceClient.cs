using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportDeploymentSourceClient(
    HttpClient httpClient,
    IOptions<CrystalReportStorageOptions> options,
    ICurrentExecutionContext executionContext,
    ILogger<CrystalReportDeploymentSourceClient> logger) : ICrystalReportDeploymentSource
{
    private static readonly JsonSerializerOptions CatalogJsonOptions =
        new(JsonSerializerDefaults.Web);

    public async Task<IReadOnlyList<DeploymentCrystalReportDescriptor>?> ListAsync(
        string? entityKey,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(
            HttpMethod.Get,
            string.IsNullOrWhiteSpace(entityKey)
                ? "internal/reports/catalog"
                : $"internal/reports/catalog?entityKey={Uri.EscapeDataString(entityKey.Trim())}");
        if (request is null)
            return null;

        try
        {
            using var response = await httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == HttpStatusCode.NotFound &&
                    !string.IsNullOrWhiteSpace(entityKey))
                    return [];

                logger.LogWarning(
                    "Crystal deployment report catalog returned HTTP {StatusCode}.",
                    (int)response.StatusCode);
                return null;
            }

            var settings = options.Value;
            var payload = await BoundedHttpContentReader.ReadAsync(
                response.Content,
                settings.MaxCatalogResponseSizeBytes,
                cancellationToken);
            if (payload is null)
                return null;

            var values = JsonSerializer.Deserialize<CatalogItem[]>(payload, CatalogJsonOptions);
            if (values is null || values.Length > settings.MaxDeploymentCandidates)
                return null;
            if (values.Any(item => !IsValidCatalogItem(item, settings.MaxFileSizeBytes)))
            {
                logger.LogWarning("Crystal deployment report catalog returned an invalid item contract.");
                return null;
            }

            return values.Select(item => new DeploymentCrystalReportDescriptor(
                    item.SourceId!,
                    item.EntityKey!,
                    item.ReportKey!,
                    item.FileName!,
                    string.IsNullOrWhiteSpace(item.Title)
                        ? Path.GetFileNameWithoutExtension(item.FileName!)
                        : item.Title.Trim(),
                    string.IsNullOrWhiteSpace(item.Subject) ? null : item.Subject.Trim(),
                    item.Size,
                    item.Sha256?.Trim() ?? string.Empty,
                    item.LastModifiedUtc,
                    item.IsImportable,
                    item.ValidationReason))
                .ToArray();
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Crystal deployment report catalog is unavailable.");
            return null;
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Crystal deployment report catalog timed out.");
            return null;
        }
        catch (JsonException exception)
        {
            logger.LogWarning(exception, "Crystal deployment report catalog returned invalid JSON.");
            return null;
        }
    }

    public async Task<CrystalReportDeploymentDownloadResult> DownloadAsync(
        string sourceId,
        string expectedSha256,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(
            HttpMethod.Get,
            $"internal/reports/catalog/{Uri.EscapeDataString(sourceId)}/source" +
            $"?expectedSha256={Uri.EscapeDataString(expectedSha256)}");
        if (request is null)
            return Failure(CrystalReportDeploymentDownloadFailure.Unavailable);

        try
        {
            using var response = await httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Crystal deployment report source returned HTTP {StatusCode}.",
                    (int)response.StatusCode);
                return response.StatusCode == HttpStatusCode.Conflict
                    ? Failure(CrystalReportDeploymentDownloadFailure.SourceChanged)
                    : Failure(CrystalReportDeploymentDownloadFailure.Unavailable);
            }

            var maximum = options.Value.MaxFileSizeBytes;
            var bytes = await BoundedHttpContentReader.ReadAsync(
                response.Content,
                maximum,
                cancellationToken);
            if (bytes is null || bytes.Length == 0)
                return Failure(CrystalReportDeploymentDownloadFailure.Unavailable);

            var actualSha256 = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
            if (!actualSha256.Equals(expectedSha256, StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("Crystal deployment report source hash did not match the catalog.");
                return Failure(CrystalReportDeploymentDownloadFailure.SourceChanged);
            }

            var disposition = response.Content.Headers.ContentDisposition;
            var fileName = disposition?.FileNameStar ?? disposition?.FileName;
            fileName = string.IsNullOrWhiteSpace(fileName)
                ? $"{sourceId}.rpt"
                : Path.GetFileName(fileName.Trim().Trim('"'));
            var contentType = response.Content.Headers.ContentType?.MediaType
                ?? "application/octet-stream";

            return new CrystalReportDeploymentDownloadResult(
                new FileUpload(
                    fileName,
                    contentType,
                    bytes.LongLength,
                    () => new MemoryStream(bytes, writable: false)),
                CrystalReportDeploymentDownloadFailure.None);
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Crystal deployment report source is unavailable.");
            return Failure(CrystalReportDeploymentDownloadFailure.Unavailable);
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Crystal deployment report source download timed out.");
            return Failure(CrystalReportDeploymentDownloadFailure.Unavailable);
        }
    }

    private static CrystalReportDeploymentDownloadResult Failure(
        CrystalReportDeploymentDownloadFailure failure) => new(null, failure);

    private static bool IsValidCatalogItem(CatalogItem item, long maximumFileSizeBytes)
    {
        if (!IsLowerHexSha256(item.SourceId) ||
            string.IsNullOrWhiteSpace(item.EntityKey) || item.EntityKey.Length > 128 ||
            string.IsNullOrWhiteSpace(item.ReportKey) || item.ReportKey.Length > 128 ||
            string.IsNullOrWhiteSpace(item.FileName) ||
            !string.Equals(Path.GetFileName(item.FileName), item.FileName, StringComparison.Ordinal) ||
            !string.Equals(Path.GetExtension(item.FileName), ".rpt", StringComparison.OrdinalIgnoreCase) ||
            item.Size < 0 || item.Size > maximumFileSizeBytes)
            return false;

        return !item.IsImportable ||
               (item.Size > 0 && IsLowerHexSha256(item.Sha256));
    }

    private static bool IsLowerHexSha256(string? value) =>
        value is { Length: 64 } && value.All(character =>
            character is >= '0' and <= '9' or >= 'a' and <= 'f');

    private HttpRequestMessage? CreateRequest(HttpMethod method, string relativeUrl)
    {
        var settings = options.Value;
        if (!settings.RuntimeEnabled)
        {
            logger.LogDebug("Crystal report runtime integration is disabled.");
            return null;
        }
        var apiKey = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            apiKey = settings.RuntimeApiKey;
        if (string.IsNullOrWhiteSpace(settings.RuntimeBaseUrl))
        {
            logger.LogError("Crystal runtime base URL is not configured.");
            return null;
        }

        var request = new HttpRequestMessage(method, relativeUrl);
        if (!string.IsNullOrWhiteSpace(apiKey))
            request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);
        if (!string.IsNullOrWhiteSpace(executionContext.CorrelationId))
            request.Headers.TryAddWithoutValidation(
                ExecutionContextHeaderNames.CorrelationId,
                executionContext.CorrelationId);
        return request;
    }

    private sealed record CatalogItem(
        string? SourceId,
        string? EntityKey,
        string? ReportKey,
        string? FileName,
        string? Title,
        string? Subject,
        long Size,
        string? Sha256,
        DateTime LastModifiedUtc,
        bool IsImportable,
        string? ValidationReason);
}
