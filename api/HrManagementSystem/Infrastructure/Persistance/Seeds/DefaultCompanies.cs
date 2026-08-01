using HrManagementSystem.Features.OrganizationalStructure.Entities;
using HrManagementSystem.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Persistance.Seeds;

public static class DefaultCompanies
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken = default)
    {
        var tenantUsers = await context.Users
            .Where(user => user.TenantId == TenantDefaults.DefaultId)
            .Select(user => user.Id)
            .ToListAsync(cancellationToken);

        if (tenantUsers.Count == 0)
            return;

        var company = await context.Companies
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                item => item.TenantId == TenantDefaults.DefaultId,
                cancellationToken);

        if (company is null)
        {
            company = new Company
            {
                TenantId = TenantDefaults.DefaultId,
                NameEn = "Default Company",
                NameAr = "Default Company",
                CreatedById = tenantUsers[0],
                CreatedByPc = Environment.MachineName
            };
            context.Companies.Add(company);
            await context.SaveChangesAsync(cancellationToken);
        }

        var assignedUserIds = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .Where(access =>
                access.TenantId == TenantDefaults.DefaultId &&
                access.CompanyId == company.Id)
            .Select(access => access.UserId)
            .ToListAsync(cancellationToken);

        var missingAccesses = tenantUsers
            .Except(assignedUserIds)
            .Select(userId => new UserCompanyAccess
            {
                TenantId = TenantDefaults.DefaultId,
                CompanyId = company.Id,
                UserId = userId,
                IsDefault = true
            });

        context.UserCompanyAccesses.AddRange(missingAccesses);
        await context.SaveChangesAsync(cancellationToken);
    }
}
