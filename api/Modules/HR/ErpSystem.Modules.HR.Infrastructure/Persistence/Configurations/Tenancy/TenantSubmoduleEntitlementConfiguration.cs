using ErpSystem.Modules.HR.Domain.Tenancy.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.HR.Infrastructure.Persistence.Configurations.Tenancy;

public sealed class TenantSubmoduleEntitlementConfiguration : IEntityTypeConfiguration<TenantSubmoduleEntitlement>
{
    public void Configure(EntityTypeBuilder<TenantSubmoduleEntitlement> builder)
    {
        builder.ToTable("TenantSubmoduleEntitlements");
        builder.HasKey(item => new { item.TenantId, item.ModuleCode, item.SubmoduleCode });
        builder.Property(item => item.TenantId).HasMaxLength(32).IsRequired();
        builder.Property(item => item.ModuleCode).HasMaxLength(32).IsRequired();
        builder.Property(item => item.SubmoduleCode).HasMaxLength(32).IsRequired();
        builder.HasOne<TenantModuleEntitlement>()
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.ModuleCode })
            .OnDelete(DeleteBehavior.Cascade);
    }
}
