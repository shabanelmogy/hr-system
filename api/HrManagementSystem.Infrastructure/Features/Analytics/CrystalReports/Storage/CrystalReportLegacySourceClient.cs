using System.Net.Http.Json;
using System.Security.Cryptography;
using HrManagementSystem.Application.Common.Files;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportLegacySourceClient(
    HttpClient httpClient,
    IOptions<CrystalReportStorageOptions> options,
    ILogger<CrystalReportLegacySourceClient> logger) : ICrystalReportLegacySource
{
    public async Task<IReadOnlyList<LegacyCrystalReportDescriptor>?> ListAsync(
        string? entityKey, CancellationToken cancellationToken)
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
                request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Legacy Crystal report catalog returned HTTP {StatusCode}.",
                    (int)response.StatusCode);
                return null;
            }

            var values = await response.Content.ReadFromJsonAsync<CatalogItem[]>(
                cancellationToken: cancellationToken);
            return values?.Select(item => new LegacyCrystalReportDescriptor(
                    item.SourceId,
                    item.EntityKey,
                    item.ReportKey,
                    item.FileName,
                    string.IsNullOrWhiteSpace(item.Title)
                        ? Path.GetFileNameWithoutExtension(item.FileName)
                        : item.Title.Trim(),
                    string.IsNullOrWhiteSpace(item.Subject) ? null : item.Subject.Trim(),
                    item.Size,
                    item.Sha256,
                    item.LastModifiedUtc,
                    item.IsImportable,
                    item.ValidationReason))
                .ToArray();
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Legacy Crystal report catalog is unavailable.");
            return null;
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Legacy Crystal report catalog timed out.");
            return null;
        }
    }

    public async Task<FileUpload?> DownloadAsync(
        string sourceId,
        string expectedSha256,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(
            HttpMethod.Get,
            $"internal/reports/catalog/{Uri.EscapeDataString(sourceId)}/source" +
            $"?expectedSha256={Uri.EscapeDataString(expectedSha256)}");
        if (request is null)
            return null;

        try
        {
            using var response = await httpClient.SendAsync(
                request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Legacy Crystal report content returned HTTP {StatusCode}.",
                    (int)response.StatusCode);
                return null;
            }

            var maximum = options.Value.MaxFileSizeBytes;
            if (response.Content.Headers.ContentLength is > 0 and var declaredLength &&
                declaredLength > maximum)
                return null;
            var bytes = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            if (bytes.Length == 0 || bytes.LongLength > maximum)
                return null;
            var actualSha256 = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
            if (!actualSha256.Equals(expectedSha256, StringComparison.OrdinalIgnoreCase))
            {
                logger.LogWarning("Legacy Crystal report content hash did not match the catalog.");
                return null;
            }

            var disposition = response.Content.Headers.ContentDisposition;
            var fileName = disposition?.FileNameStar ?? disposition?.FileName;
            fileName = string.IsNullOrWhiteSpace(fileName)
                ? $"{sourceId}.rpt"
                : Path.GetFileName(fileName.Trim().Trim('"'));
            var contentType = response.Content.Headers.ContentType?.MediaType
                ?? "application/octet-stream";
            return new FileUpload(
                fileName, contentType, bytes.LongLength,
                () => new MemoryStream(bytes, writable: false));
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Legacy Crystal report content is unavailable.");
            return null;
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Legacy Crystal report content download timed out.");
            return null;
        }
    }

    private HttpRequestMessage? CreateRequest(HttpMethod method, string relativeUrl)
    {
        var settings = options.Value;
        var apiKey = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            apiKey = settings.InspectorApiKey;
        if (string.IsNullOrWhiteSpace(settings.InspectorBaseUrl))
        {
            logger.LogError("The legacy Crystal report base URL is not configured.");
            return null;
        }

        var request = new HttpRequestMessage(method, relativeUrl);
        if (!string.IsNullOrWhiteSpace(apiKey))
            request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);
        return request;
    }

    private sealed record CatalogItem(
        string SourceId,
        string EntityKey,
        string ReportKey,
        string FileName,
        string? Title,
        string? Subject,
        long Size,
        string Sha256,
        DateTime LastModifiedUtc,
        bool IsImportable,
        string? ValidationReason);
}
