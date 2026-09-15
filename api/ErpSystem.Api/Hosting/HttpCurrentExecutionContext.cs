using System.Security.Claims;
using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.Api.Hosting;

/// <summary>
/// Host-owned execution context. HTTP requests are resolved from authenticated
/// claims; trusted background work can establish a temporary async-local scope.
/// No business-module type participates in this implementation.
/// </summary>
public sealed class HttpCurrentExecutionContext(IHttpContextAccessor httpContextAccessor) :
    ICurrentExecutionContext,
    ICurrentExecutionContextScope
{
    private readonly AsyncLocal<ExecutionOverride?> _override = new();

    public string? UserId =>
        _override.Value?.UserId ??
        NormalizeClaim(httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier));

    public string? TenantId =>
        _override.Value?.TenantId ??
        NormalizeClaim(httpContextAccessor.HttpContext?.User.FindFirstValue(ExecutionContextClaimNames.TenantId));

    public int? CompanyId
    {
        get
        {
            if (_override.Value is not null)
                return _override.Value.CompanyId;

            return int.TryParse(
                httpContextAccessor.HttpContext?.User.FindFirstValue(ExecutionContextClaimNames.CompanyId),
                out var companyId)
                ? companyId > 0 ? companyId : null
                : null;
        }
    }

    public string? MachineName => Environment.MachineName;

    public string? CorrelationId =>
        httpContextAccessor.HttpContext?.GetCorrelationId();

    public bool IsInRole(string role) =>
        httpContextAccessor.HttpContext?.User.IsInRole(role) ?? false;

    public IDisposable BeginScope(string userId, string tenantId, int? companyId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);

        if (companyId is <= 0)
            throw new ArgumentOutOfRangeException(nameof(companyId), "Company id must be positive.");

        var previous = _override.Value;
        _override.Value = new ExecutionOverride(userId, tenantId, companyId);
        return new ExecutionScope(() => _override.Value = previous);
    }

    private sealed record ExecutionOverride(string UserId, string TenantId, int? CompanyId);

    private static string? NormalizeClaim(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;

    private sealed class ExecutionScope(Action restore) : IDisposable
    {
        private Action? _restore = restore;

        public void Dispose() => Interlocked.Exchange(ref _restore, null)?.Invoke();
    }
}
