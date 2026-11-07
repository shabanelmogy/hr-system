using System.Net;
using System.Net.Http.Headers;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportDatabaseVerifierClient(
    HttpClient httpClient,
    IOptions<CrystalReportStorageOptions> options,
    ICurrentExecutionContext executionContext,
    ILogger<CrystalReportDatabaseVerifierClient> logger) : ICrystalReportDatabaseVerifier
{
    public async Task<FileUpload?> VerifyDatabaseAsync(
        string entityKey,
        FileUpload upload,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (!settings.RuntimeEnabled || string.IsNullOrWhiteSpace(settings.RuntimeBaseUrl)) return null;
        var apiKey = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey)) apiKey = settings.RuntimeApiKey;
        using var request = new HttpRequestMessage(HttpMethod.Post, "internal/reports/verify-database");
        if (!string.IsNullOrWhiteSpace(apiKey)) request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);
        if (!string.IsNullOrWhiteSpace(executionContext.CorrelationId))
            request.Headers.TryAddWithoutValidation(ExecutionContextHeaderNames.CorrelationId, executionContext.CorrelationId);
        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent(entityKey), "entityKey");
        await using var source = upload.OpenReadStream();
        using var content = new StreamContent(source);
        content.Headers.ContentType = MediaTypeHeaderValue.Parse(upload.ContentType);
        multipart.Add(content, "file", Path.GetFileName(upload.FileName));
        request.Content = multipart;
        try
        {
            using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Crystal database verification returned HTTP {StatusCode}.", (int)response.StatusCode);
                return null;
            }
            var bytes = await BoundedHttpContentReader.ReadAsync(response.Content, settings.MaxFileSizeBytes, cancellationToken);
            if (bytes is null || bytes.Length == 0) return null;
            var fileName = response.Content.Headers.ContentDisposition?.FileNameStar ??
                response.Content.Headers.ContentDisposition?.FileName ??
                Path.GetFileNameWithoutExtension(upload.FileName) + "-verified.rpt";
            return new FileUpload(Path.GetFileName(fileName.Trim('"')), "application/octet-stream", bytes.LongLength,
                () => new MemoryStream(bytes, writable: false));
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Crystal database verification service is unavailable.");
            return null;
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Crystal database verification service timed out.");
            return null;
        }
    }
}
