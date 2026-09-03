using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");
        builder.Property(x => x.DepartmentCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.DescriptionEn).HasMaxLength(2000);
        builder.Property(x => x.DescriptionAr).HasMaxLength(2000);
        builder.Property(x => x.CostCenterCode).HasMaxLength(50);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.DepartmentCode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.BranchId, x.NameEn })
            .IsUnique()
            .HasFilter("[BranchId] IS NOT NULL");
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.BranchId, x.NameAr })
            .IsUnique()
            .HasFilter("[BranchId] IS NOT NULL");
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NameEn })
            .IsUnique()
            .HasFilter("[BranchId] IS NULL");
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NameAr })
            .IsUnique()
            .HasFilter("[BranchId] IS NULL");
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.HasOne(x => x.Branch)
            .WithMany(x => x.Departments)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.BranchId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ParentDepartment)
            .WithMany(x => x.ChildDepartments)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.ParentDepartmentId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.Ignore(x => x.Manager);
        builder.Ignore(x => x.Employees);
    }
}
