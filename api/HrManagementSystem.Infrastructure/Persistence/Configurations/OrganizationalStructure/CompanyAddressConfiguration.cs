using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class CompanyAddressConfiguration : IEntityTypeConfiguration<CompanyAddress>
{
    public void Configure(EntityTypeBuilder<CompanyAddress> builder)
    {
        builder.ToTable("CompanyAddresses");
        builder.HasKey(link => link.Id);
        builder.Property(link => link.Purpose).IsRequired();
        builder.Property(link => link.IsPrimary).IsRequired();

        builder.HasIndex(link => new { link.TenantId, link.CompanyId, link.AddressId, link.Purpose })
            .IsUnique();
        builder.HasIndex(link => new { link.TenantId, link.CompanyId, link.Purpose })
            .IsUnique()
            .HasFilter("[IsPrimary] = 1 AND [IsDeleted] = 0");

        builder.HasOne(link => link.Company)
            .WithMany(company => company.Addresses)
            .HasForeignKey(link => new { link.TenantId, link.CompanyId })
            .HasPrincipalKey(company => new { company.TenantId, company.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(link => link.Address)
            .WithMany(address => address.CompanyAddresses)
            .HasForeignKey(link => new { link.TenantId, link.CompanyId, link.AddressId })
            .HasPrincipalKey(address => new { address.TenantId, address.CompanyId, address.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
