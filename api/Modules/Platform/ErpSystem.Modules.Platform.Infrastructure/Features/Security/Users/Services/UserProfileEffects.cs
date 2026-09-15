using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Services;

public sealed class UserProfileEffects(
    ICurrentActor currentActor,
    IRealtimeChangeDispatcher realtimeChanges) : IUserProfileEffects
{
    public void DispatchChange(string userId, string action)
    {
        var tenantId = currentActor.TenantId
            ?? throw new InvalidOperationException("A tenant is required to publish user changes.");
        var companyId = currentActor.CompanyId
            ?? throw new InvalidOperationException("A company is required to publish user changes.");
        var eventId = Guid.NewGuid();

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<PlatformApplicationUser>(
            RealtimeAudience.ForUserCompany(tenantId, companyId, userId),
            action,
            userId,
            eventId));
        realtimeChanges.Dispatch(RealtimeChangeRequest.For<PlatformApplicationUser>(
            RealtimeAudience.ForCompanyPermission(tenantId, companyId, PlatformPermissions.ViewUsers),
            action,
            userId,
            eventId));
    }
}
