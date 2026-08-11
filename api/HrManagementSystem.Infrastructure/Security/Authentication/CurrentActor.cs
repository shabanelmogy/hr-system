using HrManagementSystem.Application.Abstractions.Authentication;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class CurrentActor(IHttpContextAccessor httpContextAccessor) :
    ICurrentActor,
    ICurrentActorScope
{
    private readonly AsyncLocal<ActorOverride?> _override = new();

    public string? UserId =>
        _override.Value?.UserId ??
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? TenantId =>
        _override.Value?.TenantId ??
        httpContextAccessor.HttpContext?.User.FindFirstValue(JwtClaimNames.TenantId);

    public int? CompanyId
    {
        get
        {
            if (_override.Value is not null)
                return _override.Value.CompanyId;

            return int.TryParse(
                httpContextAccessor.HttpContext?.User.FindFirstValue(JwtClaimNames.CompanyId),
                out var companyId)
                ? companyId
                : null;
        }
    }

    public IDisposable BeginScope(string userId, string tenantId, int? companyId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);

        if (companyId is <= 0)
            throw new ArgumentOutOfRangeException(nameof(companyId), "Company id must be positive.");

        var previous = _override.Value;
        _override.Value = new ActorOverride(userId, tenantId, companyId);

        return new ActorScope(() => _override.Value = previous);
    }

    private sealed record ActorOverride(string UserId, string TenantId, int? CompanyId);

    private sealed class ActorScope(Action restore) : IDisposable
    {
        private Action? _restore = restore;

        public void Dispose() => Interlocked.Exchange(ref _restore, null)?.Invoke();
    }
}
