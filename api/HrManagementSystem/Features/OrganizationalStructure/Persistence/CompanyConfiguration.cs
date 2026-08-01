using HrManagementSystem.Features.OrganizationalStructure.Entities;

namespace HrManagementSystem.Features.OrganizationalStructure.Persistence;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies");
        builder.HasKey(company => company.Id);
        builder.HasAlternateKey(company => new { company.TenantId, company.Id });
        builder.Property(company => company.NameEn).HasMaxLength(200).IsRequired();
        builder.Property(company => company.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(company => company.LegalName).HasMaxLength(250);
        builder.Property(company => company.Email).HasMaxLength(254);
        builder.Property(company => company.Phone).HasMaxLength(30);
        builder.Property(company => company.Website).HasMaxLength(500);
        builder.HasIndex(company => new { company.TenantId, company.NameEn }).IsUnique();
        builder.HasIndex(company => new { company.TenantId, company.NameAr }).IsUnique();

        // These modules are not persisted yet. Enable their navigations with their feature migrations.
        builder.Ignore(company => company.Address);
        builder.Ignore(company => company.Branches);
        builder.Ignore(company => company.Employees);
    }
}
