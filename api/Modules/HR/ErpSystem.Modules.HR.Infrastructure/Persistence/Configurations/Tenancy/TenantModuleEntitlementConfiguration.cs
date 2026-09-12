using ErpSystem.Modules.HR.Domain.Tenancy.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.HR.Infrastructure.Persistence.Configurations.Tenancy;

public sealed class TenantModuleEntitlementConfiguration : IEntityTypeConfiguration<TenantModuleEntitlement>
{
    public void Configure(EntityTypeBuilder<TenantModuleEntitlement> builder)
    {
        builder.ToTable("TenantModuleEntitlements");
        builder.HasKey(item => new { item.TenantId, item.ModuleCode });
        builder.Property(item => item.TenantId).HasMaxLength(32).IsRequired();
        builder.Property(item => item.ModuleCode).HasMaxLength(32).IsRequired();
        builder.HasOne<Tenant>()
            .WithMany()
            .HasForeignKey(item => item.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
