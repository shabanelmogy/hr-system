using HrManagementSystem.Features.Platform.Tenancy.Entities;

namespace HrManagementSystem.Features.Platform.Tenancy.Persistence;

public sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");
        builder.HasKey(tenant => tenant.Id);
        builder.Property(tenant => tenant.Id).HasMaxLength(32);
        builder.Property(tenant => tenant.Identifier).HasMaxLength(100).IsRequired();
        builder.Property(tenant => tenant.Name).HasMaxLength(200).IsRequired();
        builder.HasIndex(tenant => tenant.Identifier).IsUnique();
    }
}
