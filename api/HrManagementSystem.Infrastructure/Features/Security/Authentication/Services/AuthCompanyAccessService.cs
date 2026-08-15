using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Domain.Tenancy.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthCompanyAccessService(
    ApplicationDbContext context,
    ICurrentActor currentActor)
{
    public Task<bool> HasTenantAccessAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken) =>
        context.UserTenantAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(
                access =>
                    access.UserId == userId &&
                    access.TenantId == tenantId &&
                    access.Tenant.IsActive &&
                    access.Tenant.SubscriptionStatus != SubscriptionStatus.Suspended &&
                    access.Tenant.SubscriptionStatus != SubscriptionStatus.Cancelled,
                cancellationToken);

    public async Task<IReadOnlyList<TenantOptionResponse>> GetAvailableTenantsAsync(
        string userId,
        CancellationToken cancellationToken) =>
        await context.UserTenantAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.UserId == userId &&
                access.Tenant.IsActive &&
                access.Tenant.SubscriptionStatus != SubscriptionStatus.Suspended &&
                access.Tenant.SubscriptionStatus != SubscriptionStatus.Cancelled)
            .OrderByDescending(access => access.IsDefault)
            .ThenBy(access => access.Tenant.Name)
            .Select(access => new TenantOptionResponse(
                access.TenantId,
                access.Tenant.Identifier,
                access.Tenant.Name))
            .ToListAsync(cancellationToken);

    public async Task<bool> HasCompanyAccessAsync(
        string userId,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken)
    {
        if (!await HasTenantAccessAsync(userId, tenantId, cancellationToken))
            return false;

        return await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AnyAsync(access =>
                access.UserId == userId &&
                access.TenantId == tenantId &&
                access.CompanyId == companyId &&
                access.Company.IsActive,
                cancellationToken);
    }

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

    public async Task<IReadOnlyList<CompanyOptionResponse>> GetAvailableCompaniesAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken) =>
        await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access =>
                access.UserId == userId &&
                access.TenantId == tenantId &&
                access.Company.IsActive)
            .OrderByDescending(access => access.IsDefault)
            .ThenBy(access => access.Company.NameEn)
            .Select(access => new CompanyOptionResponse(
                access.CompanyId,
                access.Company.NameAr,
                access.Company.NameEn))
            .ToListAsync(cancellationToken);

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
