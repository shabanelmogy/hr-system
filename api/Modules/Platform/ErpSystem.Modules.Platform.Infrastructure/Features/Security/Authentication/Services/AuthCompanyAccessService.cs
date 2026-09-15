using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Entities;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthCompanyAccessService(
    PlatformDbContext context,
    ICurrentActor currentActor)
{
    public async Task<bool> IsUserWithinActorCompanyScopeAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentActor.UserId))
            return false;

        var actorCompanyIds = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.TenantId == tenantId &&
                access.UserId == currentActor.UserId)
            .Select(access => access.CompanyId)
            .ToHashSetAsync(cancellationToken);
        var userCompanyIds = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.TenantId == tenantId && access.UserId == userId)
            .Select(access => access.CompanyId)
            .Distinct()
            .ToArrayAsync(cancellationToken);

        return userCompanyIds.Length > 0 && userCompanyIds.All(actorCompanyIds.Contains);
    }

    public async Task AssignDefaultCompanyAsync(
        PlatformApplicationUser user,
        CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId))
            return;

        var hasTenantAccess = await context.UserTenantAccesses
            .IgnoreQueryFilters()
            .AnyAsync(access =>
                access.UserId == user.Id && access.TenantId == tenantId,
                cancellationToken);
        if (!hasTenantAccess)
        {
            context.UserTenantAccesses.Add(new PlatformUserTenantAccess
            {
                UserId = user.Id,
                TenantId = tenantId,
                IsDefault = true
            });
        }

        var companyId = await context.Companies
            .IgnoreQueryFilters()
            .Where(company => company.TenantId == tenantId && company.IsActive)
            .OrderBy(company => company.Id)
            .Select(company => (int?)company.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (!companyId.HasValue)
        {
            await context.SaveChangesAsync(cancellationToken);
            return;
        }

        context.UserCompanyAccesses.Add(new PlatformUserCompanyAccess
        {
            TenantId = tenantId,
            CompanyId = companyId.Value,
            UserId = user.Id,
            IsDefault = true
        });
        await context.SaveChangesAsync(cancellationToken);
    }
}
