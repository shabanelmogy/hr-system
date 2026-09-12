using System.Text.Json;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;

namespace ErpSystem.Modules.Platform.Application.SecurityAudits;

internal sealed class SecurityAuditService(
    ICurrentExecutionContext currentExecutionContext,
    ISecurityAuditRequestContextSource requestContextSource,
    ISecurityAuditStore store,
    TimeProvider timeProvider) : ISecurityAuditService
{
    private static readonly string[] SensitiveKeyFragments =
    [
        "password",
        "token",
        "secret",
        "credential",
        "authorization",
        "cookie"
    ];

    public void Add(SecurityAuditRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        ValidateMetadata(request.Metadata);

        var requestContext = requestContextSource.GetCurrent();
        var metadataJson = request.Metadata is { Count: > 0 }
            ? JsonSerializer.Serialize(request.Metadata)
            : null;

        store.Add(new SecurityAuditRecord(
            Guid.NewGuid(),
            NormalizeOptional(request.TenantId ?? currentExecutionContext.TenantId),
            request.CompanyId ?? currentExecutionContext.CompanyId,
            NormalizeOptional(currentExecutionContext.UserId),
            Required(request.Action, "action"),
            Required(request.TargetType, "targetType"),
            NormalizeLimited(request.TargetId, 450),
            request.Outcome,
            NormalizeLimited(request.Reason, 1000),
            NormalizeLimited(requestContext.IpAddress, 64),
            NormalizeLimited(requestContext.UserAgent, 512),
            NormalizeLimited(requestContext.CorrelationId, 128),
            metadataJson,
            timeProvider.GetUtcNow().UtcDateTime));
    }

    public async Task RecordAsync(
        SecurityAuditRequest request,
        CancellationToken cancellationToken = default)
    {
        Add(request);
        await store.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    private static void ValidateMetadata(IReadOnlyDictionary<string, string?>? metadata)
    {
        if (metadata is null)
            return;

        var sensitiveKey = metadata.Keys.FirstOrDefault(key =>
            SensitiveKeyFragments.Any(fragment =>
                key.Contains(fragment, StringComparison.OrdinalIgnoreCase)));

        if (sensitiveKey is not null)
        {
            throw new ArgumentException(
                $"Security audit metadata must not contain sensitive key '{sensitiveKey}'.",
                nameof(metadata));
        }
    }

    private static string Required(string value, string parameterName) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("A value is required.", parameterName)
            : value.Trim();

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizeLimited(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var limited = value.Length <= maxLength ? value : value[..maxLength];
        return NormalizeOptional(limited);
    }
}
