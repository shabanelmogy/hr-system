using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class DivisionConfiguration : IEntityTypeConfiguration<Division>
{
    public void Configure(EntityTypeBuilder<Division> builder)
    {
        builder.ToTable("Divisions");
        builder.Property(x => x.DivisionCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.DescriptionEn).HasMaxLength(2000);
        builder.Property(x => x.DescriptionAr).HasMaxLength(2000);
        builder.Property(x => x.CostCenterCode).HasMaxLength(50);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.DivisionCode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.DepartmentId, x.NameEn }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.DepartmentId, x.NameAr }).IsUnique();
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.HasOne(x => x.Department)
            .WithMany(x => x.Divisions)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.DepartmentId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.Ignore(x => x.Manager);
        builder.Ignore(x => x.Employees);
    }
}
