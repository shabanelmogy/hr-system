using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

/// <summary>Branch directory persistence. Employee/department workflows remain outside this slice.</summary>
public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches");
        builder.Property(x => x.BranchCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.TimeZoneId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(254);
        builder.Property(x => x.Phone).HasMaxLength(50);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.BranchCode }).IsUnique();
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });
        builder.Ignore(x => x.Company);
        builder.Ignore(x => x.Manager);
        builder.Ignore(x => x.Employees);
        builder.Ignore(x => x.Departments);
    }
}
