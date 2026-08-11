using HrManagementSystem.Domain.Tenancy.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Seeds;

public static class DefaultTenants
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken = default)
    {
        if (await context.Tenants.AnyAsync(
                tenant => tenant.Id == TenantDefaults.DefaultId,
                cancellationToken))
        {
            return;
        }

        context.Tenants.Add(new Tenant
        {
            Id = TenantDefaults.DefaultId,
            Identifier = TenantDefaults.DefaultIdentifier,
            Name = TenantDefaults.DefaultName
        });

        await context.SaveChangesAsync(cancellationToken);
    }
}
