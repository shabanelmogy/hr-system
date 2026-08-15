using System.Text.Json;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Domain.Platform.SecurityAudits.Entities;

namespace HrManagementSystem.Infrastructure.Features.Platform.SecurityAudits.Services;

public sealed class SecurityAuditService(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    IHttpContextAccessor httpContextAccessor,
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

        var httpContext = httpContextAccessor.HttpContext;
        var metadataJson = request.Metadata is { Count: > 0 }
            ? JsonSerializer.Serialize(request.Metadata)
            : null;

        context.SecurityAuditEvents.Add(new SecurityAuditEvent(
            Guid.NewGuid(),
            request.Action,
            request.TargetType,
            request.Outcome,
            timeProvider.GetUtcNow().UtcDateTime,
            request.TenantId ?? currentActor.TenantId,
            request.CompanyId ?? currentActor.CompanyId,
            currentActor.UserId,
            Limit(request.TargetId, 450),
            Limit(request.Reason, 1000),
            Limit(httpContext?.Connection.RemoteIpAddress?.ToString(), 64),
            Limit(httpContext?.Request.Headers.UserAgent.ToString(), 512),
            Limit(httpContext?.TraceIdentifier, 128),
            metadataJson));
    }

    public async Task RecordAsync(
        SecurityAuditRequest request,
        CancellationToken cancellationToken = default)
    {
        Add(request);
        await context.SaveChangesAsync(cancellationToken);
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

    private static string? Limit(string? value, int maxLength) =>
        string.IsNullOrWhiteSpace(value)
            ? null
            : value.Length <= maxLength
                ? value
                : value[..maxLength];
}
