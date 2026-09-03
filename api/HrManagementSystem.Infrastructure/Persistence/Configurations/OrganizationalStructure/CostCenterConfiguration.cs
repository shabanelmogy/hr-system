using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class CostCenterConfiguration : IEntityTypeConfiguration<CostCenter>
{
    public void Configure(EntityTypeBuilder<CostCenter> builder)
    {
        builder.ToTable("CostCenters");
        builder.Property(x => x.CostCenterCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.DescriptionEn).HasMaxLength(2000);
        builder.Property(x => x.DescriptionAr).HasMaxLength(2000);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.CostCenterCode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NameEn });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NameAr });
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.HasOne(x => x.ParentCostCenter)
            .WithMany(x => x.ChildCostCenters)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.ParentCostCenterId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.Ignore(x => x.Manager);
    }
}
