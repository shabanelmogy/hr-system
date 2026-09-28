using System.Net.Http.Headers;
using System.Text.Json;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;

public sealed class CrystalReportInspectorClient(
    HttpClient httpClient,
    IOptions<CrystalReportStorageOptions> options,
    ICurrentExecutionContext executionContext,
    ILogger<CrystalReportInspectorClient> logger) : ICrystalReportInspector
{
    public async Task<CrystalReportInspection?> InspectAsync(
        string entityKey,
        FileUpload upload,
        CancellationToken cancellationToken)
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
            logger.LogError("Crystal report inspector base URL is not configured.");
            return null;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "internal/reports/inspect");
        if (!string.IsNullOrWhiteSpace(apiKey))
            request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", apiKey);
        AddCorrelationHeader(request, executionContext.CorrelationId);
        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent(entityKey), "entityKey");
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
            var payload = await BoundedHttpContentReader.ReadAsync(
                response.Content,
                settings.MaxInspectionResponseSizeBytes,
                cancellationToken);
            if (payload is null || payload.Length == 0)
            {
                logger.LogWarning("Crystal report inspection service returned an invalid response size.");
                return null;
            }

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning(
                    "Crystal report inspection service returned HTTP {StatusCode}.",
                    (int)response.StatusCode);
                if (response.StatusCode != System.Net.HttpStatusCode.BadRequest)
                    return null;

                try
                {
                    var error = JsonSerializer.Deserialize<InspectionErrorResponse>(
                        payload,
                        InspectionJsonOptions);
                    return new CrystalReportInspection(
                        false,
                        null,
                        null,
                        "Crystal runtime rejected the report.",
                        null,
                        null,
                        ToInspectionFailure(error?.Code));
                }
                catch (JsonException exception)
                {
                    logger.LogWarning(exception, "Crystal report inspection service returned invalid error JSON.");
                    return null;
                }
            }

            InspectionResponse? result;
            try
            {
                result = JsonSerializer.Deserialize<InspectionResponse>(payload, InspectionJsonOptions);
            }
            catch (JsonException exception)
            {
                logger.LogWarning(exception, "Crystal report inspection service returned invalid JSON.");
                return null;
            }
            if (result is null)
                return null;
            if (!result.IsValid || result.HasSavedData || result.HasEmbeddedCredentials)
            {
                var reason = result.HasEmbeddedCredentials
                    ? "Embedded report credentials are not allowed."
                    : result.HasSavedData
                        ? "Saved report data is not allowed."
                        : "Crystal runtime rejected the report.";
                return new CrystalReportInspection(
                    false,
                    result.Title,
                    result.Subject,
                    reason,
                    null,
                    null,
                    result.Failure);
            }

            if (result.ContractSchemaVersion is not > 0 ||
                result.ContractFingerprint is not { Length: 64 })
                return null;

            return new CrystalReportInspection(
                true,
                result.Title,
                result.Subject,
                null,
                result.ContractSchemaVersion,
                result.ContractFingerprint,
                CrystalReportInspectionFailure.None);
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
        int SubreportCount,
        int? ContractSchemaVersion,
        string? ContractFingerprint,
        CrystalReportInspectionFailure Failure = CrystalReportInspectionFailure.None);

    private sealed record InspectionErrorResponse(string? Code, string? Message);

    private static CrystalReportInspectionFailure ToInspectionFailure(string? code) => code switch
    {
        "crystal_runtime_unsupported_profile" => CrystalReportInspectionFailure.UnsupportedEntity,
        "crystal_runtime_schema_mismatch" => CrystalReportInspectionFailure.SchemaMismatch,
        "crystal_runtime_parameter_mismatch" => CrystalReportInspectionFailure.ParameterMismatch,
        _ => CrystalReportInspectionFailure.InvalidReport
    };

    private static readonly JsonSerializerOptions InspectionJsonOptions =
        new(JsonSerializerDefaults.Web);

    private static void AddCorrelationHeader(HttpRequestMessage request, string? correlationId)
    {
        if (!string.IsNullOrWhiteSpace(correlationId))
            request.Headers.TryAddWithoutValidation(ExecutionContextHeaderNames.CorrelationId, correlationId);
    }
}
