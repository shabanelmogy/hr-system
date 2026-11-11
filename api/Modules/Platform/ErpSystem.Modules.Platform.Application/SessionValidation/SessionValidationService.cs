using ErpSystem.Modules.Platform.Application.SessionValidation;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

namespace ErpSystem.Modules.Platform.Application.SessionValidation;

internal sealed class SessionValidationService(
    ISessionValidationSource source,
    TimeProvider timeProvider) : ISessionValidationService
{
    public async Task<SessionValidationResult> ValidateAsync(
        SessionValidationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var system = request.SessionScope == AuthenticationTokenClaimNames.SystemSession;
        if (system
                ? request.TenantId.Length != 0 || request.CompanyId != 0
                : request.SessionScope != AuthenticationTokenClaimNames.CompanySession ||
                  string.IsNullOrWhiteSpace(request.TenantId) || request.CompanyId <= 0)
            return new SessionValidationResult(false);

        var snapshot = await source.GetAsync(
            request.UserId,
            request.SessionId,
            request.TenantId,
            request.CompanyId,
            cancellationToken).ConfigureAwait(false);

        if (snapshot is null)
            return new SessionValidationResult(false);

        var now = timeProvider.GetUtcNow();
        var tenantEligible =
            snapshot.HasTenantMembership &&
            snapshot.IsTenantActive &&
            snapshot.TenantSubscriptionStatus is not null &&
            snapshot.TenantSubscriptionStatus != TenantSubscriptionStatus.Suspended &&
            snapshot.TenantSubscriptionStatus != TenantSubscriptionStatus.Cancelled;
        var companyEligible = snapshot.HasCompanyAccess && snapshot.IsCompanyActive;
        var hasActiveSession = snapshot.RefreshSessions.Any(session =>
            string.Equals(session.SessionId, request.SessionId, StringComparison.Ordinal) &&
            session.CompanyId == request.CompanyId &&
            session.RevokedOn is null &&
            session.ExpiresOn > now.UtcDateTime);

        var isValid =
            !snapshot.IsDisabled &&
            !snapshot.IsArchived &&
            (!system || snapshot.EmailConfirmed) &&
            (snapshot.LockoutEnd is null || snapshot.LockoutEnd <= now) &&
            string.Equals(snapshot.SecurityStamp, request.SecurityStamp, StringComparison.Ordinal) &&
            (system ? snapshot.IsSuperAdmin : tenantEligible && companyEligible) &&
            hasActiveSession;

        return new SessionValidationResult(isValid);
    }
}
