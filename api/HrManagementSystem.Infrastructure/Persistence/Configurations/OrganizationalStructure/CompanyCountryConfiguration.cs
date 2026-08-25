using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class CompanyCountryConfiguration : IEntityTypeConfiguration<CompanyCountry>
{
    public void Configure(EntityTypeBuilder<CompanyCountry> builder)
    {
        builder.ToTable("CompanyCountries");
        builder.HasKey(companyCountry => companyCountry.Id);

        builder.HasOne(companyCountry => companyCountry.Country)
            .WithMany()
            .HasForeignKey(companyCountry => companyCountry.CountryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasIndex(companyCountry => new
            {
                companyCountry.TenantId,
                companyCountry.CompanyId,
                companyCountry.CountryId
            })
            .IsUnique();

        builder.HasIndex(companyCountry => new
            {
                companyCountry.TenantId,
                companyCountry.CompanyId
            })
            .IsUnique()
            .HasFilter("[IsDefault] = 1 AND [IsDeleted] = 0");
    }
}
