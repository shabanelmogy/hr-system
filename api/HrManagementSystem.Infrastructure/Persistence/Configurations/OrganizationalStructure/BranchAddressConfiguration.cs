using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class BranchAddressConfiguration : IEntityTypeConfiguration<BranchAddress>
{
    public void Configure(EntityTypeBuilder<BranchAddress> builder)
    {
        builder.ToTable("BranchAddresses");
        builder.HasKey(link => link.Id);
        builder.Property(link => link.Purpose).IsRequired();
        builder.Property(link => link.IsPrimary).IsRequired();

        builder.HasIndex(link => new { link.TenantId, link.CompanyId, link.BranchId, link.AddressId, link.Purpose })
            .IsUnique();
        builder.HasIndex(link => new { link.TenantId, link.CompanyId, link.BranchId, link.Purpose })
            .IsUnique()
            .HasFilter("[IsPrimary] = 1 AND [IsDeleted] = 0");

        builder.HasOne(link => link.Branch)
            .WithMany(branch => branch.Addresses)
            .HasForeignKey(link => new { link.TenantId, link.CompanyId, link.BranchId })
            .HasPrincipalKey(branch => new { branch.TenantId, branch.CompanyId, branch.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(link => link.Address)
            .WithMany(address => address.BranchAddresses)
            .HasForeignKey(link => new { link.TenantId, link.CompanyId, link.AddressId })
            .HasPrincipalKey(address => new { address.TenantId, address.CompanyId, address.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
