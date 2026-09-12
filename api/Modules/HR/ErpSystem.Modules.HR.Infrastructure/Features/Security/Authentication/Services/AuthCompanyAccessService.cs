using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthCompanyAccessService(
    ApplicationDbContext context,
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
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var hasTenantAccess = await context.UserTenantAccesses
            .IgnoreQueryFilters()
            .AnyAsync(access =>
                access.UserId == user.Id && access.TenantId == user.TenantId,
                cancellationToken);
        if (!hasTenantAccess)
        {
            context.UserTenantAccesses.Add(new UserTenantAccess
            {
                UserId = user.Id,
                TenantId = user.TenantId,
                IsDefault = true
            });
        }

        var companyId = await context.Companies
            .IgnoreQueryFilters()
            .Where(company => company.TenantId == user.TenantId && company.IsActive)
            .OrderBy(company => company.Id)
            .Select(company => (int?)company.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (!companyId.HasValue)
        {
            await context.SaveChangesAsync(cancellationToken);
            return;
        }

        context.UserCompanyAccesses.Add(new UserCompanyAccess
        {
            TenantId = user.TenantId,
            CompanyId = companyId.Value,
            UserId = user.Id,
            IsDefault = true
        });
        await context.SaveChangesAsync(cancellationToken);
    }
}
