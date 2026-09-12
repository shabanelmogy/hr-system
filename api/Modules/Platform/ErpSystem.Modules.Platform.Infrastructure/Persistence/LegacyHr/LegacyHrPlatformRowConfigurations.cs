using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Platform.Infrastructure.Persistence.LegacyHr;

internal static class LegacyHrSchema
{
    public const string Name = "hr";
}

internal sealed class LegacyTenantRowConfiguration : IEntityTypeConfiguration<LegacyTenantRow>
{
    public void Configure(EntityTypeBuilder<LegacyTenantRow> builder)
    {
        builder.ToTable("Tenants", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => row.Id);
        builder.Property(row => row.Id).HasMaxLength(32);
        builder.Property(row => row.Identifier).HasMaxLength(100);
        builder.Property(row => row.Name).HasMaxLength(200);
        builder.Property(row => row.SubscriptionStatus).HasMaxLength(32);
        builder.Property(row => row.PlanName).HasMaxLength(100);
    }
}

internal sealed class LegacyCompanyRowConfiguration : IEntityTypeConfiguration<LegacyCompanyRow>
{
    public void Configure(EntityTypeBuilder<LegacyCompanyRow> builder)
    {
        builder.ToTable("Companies", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => row.Id);
        builder.Property(row => row.TenantId).HasMaxLength(32);
        builder.Property(row => row.CompanyCode).HasMaxLength(50);
        builder.Property(row => row.NameAr).HasMaxLength(200);
        builder.Property(row => row.NameEn).HasMaxLength(200);
    }
}

internal sealed class LegacyIdentityUserRowConfiguration : IEntityTypeConfiguration<LegacyIdentityUserRow>
{
    public void Configure(EntityTypeBuilder<LegacyIdentityUserRow> builder)
    {
        builder.ToTable("AspNetUsers", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => row.Id);
        builder.Property(row => row.Id).HasMaxLength(450);
        builder.Property(row => row.SecurityStamp).HasMaxLength(450);
    }
}

internal sealed class LegacyUserTenantAccessRowConfiguration : IEntityTypeConfiguration<LegacyUserTenantAccessRow>
{
    public void Configure(EntityTypeBuilder<LegacyUserTenantAccessRow> builder)
    {
        builder.ToTable("UserTenantAccesses", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => new { row.UserId, row.TenantId });
        builder.Property(row => row.UserId).HasMaxLength(450);
        builder.Property(row => row.TenantId).HasMaxLength(32);
    }
}

internal sealed class LegacyUserCompanyAccessRowConfiguration : IEntityTypeConfiguration<LegacyUserCompanyAccessRow>
{
    public void Configure(EntityTypeBuilder<LegacyUserCompanyAccessRow> builder)
    {
        builder.ToTable("UserCompanyAccesses", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => new { row.UserId, row.CompanyId });
        builder.Property(row => row.UserId).HasMaxLength(450);
        builder.Property(row => row.TenantId).HasMaxLength(32);
    }
}

internal sealed class LegacyRefreshSessionRowConfiguration : IEntityTypeConfiguration<LegacyRefreshSessionRow>
{
    public void Configure(EntityTypeBuilder<LegacyRefreshSessionRow> builder)
    {
        builder.ToTable("RefreshToken", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => new { row.ApplicationUserId, row.Id });
        builder.Property(row => row.ApplicationUserId).HasMaxLength(450);
        builder.Property(row => row.SessionId).HasMaxLength(32);
    }
}

internal sealed class LegacyRoleRowConfiguration : IEntityTypeConfiguration<LegacyRoleRow>
{
    public void Configure(EntityTypeBuilder<LegacyRoleRow> builder)
    {
        builder.ToTable("AspNetRoles", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => row.Id);
        builder.Property(row => row.Id).HasMaxLength(450);
        builder.Property(row => row.Name).HasMaxLength(256);
        builder.Property(row => row.NormalizedName).HasMaxLength(256);
        builder.Property(row => row.TenantId).HasMaxLength(32);
    }
}

internal sealed class LegacyUserRoleRowConfiguration : IEntityTypeConfiguration<LegacyUserRoleRow>
{
    public void Configure(EntityTypeBuilder<LegacyUserRoleRow> builder)
    {
        builder.ToTable("AspNetUserRoles", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => new { row.UserId, row.RoleId });
        builder.Property(row => row.UserId).HasMaxLength(450);
        builder.Property(row => row.RoleId).HasMaxLength(450);
    }
}

internal sealed class LegacyRoleClaimRowConfiguration : IEntityTypeConfiguration<LegacyRoleClaimRow>
{
    public void Configure(EntityTypeBuilder<LegacyRoleClaimRow> builder)
    {
        builder.ToTable("AspNetRoleClaims", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => row.Id);
        builder.Property(row => row.RoleId).HasMaxLength(450);
    }
}

internal sealed class LegacyTenantModuleEntitlementRowConfiguration : IEntityTypeConfiguration<LegacyTenantModuleEntitlementRow>
{
    public void Configure(EntityTypeBuilder<LegacyTenantModuleEntitlementRow> builder)
    {
        builder.ToTable("TenantModuleEntitlements", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => new { row.TenantId, row.ModuleCode });
        builder.Property(row => row.TenantId).HasMaxLength(32);
        builder.Property(row => row.ModuleCode).HasMaxLength(32);
    }
}

internal sealed class LegacyTenantSubmoduleEntitlementRowConfiguration : IEntityTypeConfiguration<LegacyTenantSubmoduleEntitlementRow>
{
    public void Configure(EntityTypeBuilder<LegacyTenantSubmoduleEntitlementRow> builder)
    {
        builder.ToTable("TenantSubmoduleEntitlements", LegacyHrSchema.Name, table => table.ExcludeFromMigrations());
        builder.HasKey(row => new { row.TenantId, row.ModuleCode, row.SubmoduleCode });
        builder.Property(row => row.TenantId).HasMaxLength(32);
        builder.Property(row => row.ModuleCode).HasMaxLength(32);
        builder.Property(row => row.SubmoduleCode).HasMaxLength(32);
    }
}
