using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies");
        builder.HasKey(company => company.Id);
        builder.HasAlternateKey(company => new { company.TenantId, company.Id });
        builder.Property(company => company.CompanyCode).HasMaxLength(50).IsRequired();
        builder.Property(company => company.NameEn).HasMaxLength(200).IsRequired();
        builder.Property(company => company.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(company => company.LegalName).HasMaxLength(250);
        builder.Property(company => company.RegistrationNumber).HasMaxLength(100);
        builder.Property(company => company.TaxNumber).HasMaxLength(100);
        builder.Property(company => company.DefaultCurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(company => company.TimeZoneId).HasMaxLength(100).IsRequired();
        builder.Property(company => company.Email).HasMaxLength(254);
        builder.Property(company => company.Phone).HasMaxLength(30);
        builder.Property(company => company.Website).HasMaxLength(500);
        builder.HasIndex(company => new { company.TenantId, company.NameEn }).IsUnique();
        builder.HasIndex(company => new { company.TenantId, company.NameAr }).IsUnique();
        builder.HasIndex(company => new { company.TenantId, company.CompanyCode }).IsUnique();

        // Enable these navigations with their owning feature migrations.
        builder.Ignore(company => company.Branches);
        builder.Ignore(company => company.Employees);
    }
}
