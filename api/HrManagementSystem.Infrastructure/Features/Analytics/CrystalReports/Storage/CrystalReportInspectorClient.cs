using System.Net.Http.Headers;
using System.Net.Http.Json;
using HrManagementSystem.Application.Common.Files;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportInspectorClient(
    HttpClient httpClient,
    IOptions<CrystalReportStorageOptions> options,
    ILogger<CrystalReportInspectorClient> logger) : ICrystalReportInspector
{
    public async Task<CrystalReportInspection?> InspectAsync(
        FileUpload upload, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var apiKey = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            apiKey = settings.InspectorApiKey;
        if (string.IsNullOrWhiteSpace(settings.InspectorBaseUrl))
        {
            logger.LogError("Crystal report inspector base URL is not configured.");
            return null;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "internal/reports/inspect");
        if (!string.IsNullOrWhiteSpace(apiKey))
            request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);
        using var multipart = new MultipartFormDataContent();
        await using var source = upload.OpenReadStream();
        using var content = new StreamContent(source);
        if (MediaTypeHeaderValue.TryParse(upload.ContentType, out var mediaType))
            content.Headers.ContentType = mediaType;
        multipart.Add(content, "file", Path.GetFileName(upload.FileName));
        request.Content = multipart;

        try
        {
            using var response = await httpClient.SendAsync(
                request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Crystal report inspection service returned HTTP {StatusCode}.",
                    (int)response.StatusCode);
                return response.StatusCode == System.Net.HttpStatusCode.BadRequest
                    ? new CrystalReportInspection(false, null, null, "Crystal runtime rejected the report.")
                    : null;
            }

            var result = await response.Content.ReadFromJsonAsync<InspectionResponse>(
                cancellationToken: cancellationToken);
            if (result is null)
                return null;
            if (!result.IsValid || result.HasSavedData || result.HasEmbeddedCredentials)
            {
                var reason = result.HasEmbeddedCredentials
                    ? "Embedded report credentials are not allowed."
                    : result.HasSavedData
                        ? "Saved report data is not allowed."
                        : "Crystal runtime rejected the report.";
                return new CrystalReportInspection(false, result.Title, result.Subject, reason);
            }

            return new CrystalReportInspection(true, result.Title, result.Subject, null);
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Crystal report inspection service is unavailable.");
            return null;
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Crystal report inspection service timed out.");
            return null;
        }
    }

    private sealed record InspectionResponse(
        bool IsValid,
        string? Title,
        string? Subject,
        bool HasSavedData,
        bool HasEmbeddedCredentials,
        int SubreportCount);
}
