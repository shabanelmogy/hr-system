using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Domain.Tenancy.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Tenancy;

public sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");
        builder.HasKey(tenant => tenant.Id);
        builder.Property(tenant => tenant.Id).HasMaxLength(32);
        builder.Property(tenant => tenant.Identifier).HasMaxLength(100).IsRequired();
        builder.Property(tenant => tenant.Name).HasMaxLength(200).IsRequired();
        builder.Property(tenant => tenant.SubscriptionStatus)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();
        builder.Property(tenant => tenant.LifecycleStatus)
            .HasConversion<string>()
            .HasMaxLength(32)
            .HasDefaultValue(TenantLifecycleStatus.Active)
            .IsRequired();
        builder.Property(tenant => tenant.ArchiveReason).HasMaxLength(1000);
        builder.Property(tenant => tenant.RowVersion).IsRowVersion();
        builder.Property(tenant => tenant.PlanName).HasMaxLength(100);
        builder.Property(tenant => tenant.BillingEmail).HasMaxLength(256);
        builder.Property(tenant => tenant.ContactName).HasMaxLength(200);
        builder.Property(tenant => tenant.ContactPhone).HasMaxLength(32);
        builder.Property(tenant => tenant.Notes).HasMaxLength(2000);
        builder.HasIndex(tenant => tenant.Identifier).IsUnique();
    }
}
