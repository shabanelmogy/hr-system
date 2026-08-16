using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Persistence;

public sealed class ApplicationRoleConfiguration : IEntityTypeConfiguration<ApplicationRole>
{
    public void Configure(EntityTypeBuilder<ApplicationRole> builder)
    {
        builder.Property(role => role.TenantId).HasMaxLength(32);

        builder.HasOne<Tenant>()
            .WithMany()
            .HasForeignKey(role => role.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(role => role.NormalizedName)
            .HasDatabaseName("IX_AspNetRoles_System_NormalizedName")
            .IsUnique()
            .HasFilter("[IsSystem] = 1 AND [NormalizedName] IS NOT NULL");

        builder.HasIndex(role => new { role.TenantId, role.NormalizedName })
            .HasDatabaseName("IX_AspNetRoles_Tenant_NormalizedName")
            .IsUnique()
            .HasFilter("[IsSystem] = 0 AND [TenantId] IS NOT NULL AND [NormalizedName] IS NOT NULL");

        builder.ToTable(table => table.HasCheckConstraint(
            "CK_AspNetRoles_SystemTenantConsistency",
            "([IsSystem] = 1 AND [TenantId] IS NULL AND [NormalizedName] IN ('SUPER_ADMIN', 'ADMIN', 'USER')) " +
            "OR ([IsSystem] = 0 AND [TenantId] IS NOT NULL AND " +
            "([NormalizedName] IS NULL OR [NormalizedName] NOT IN ('SUPER_ADMIN', 'ADMIN', 'USER')))"));
    }
}
