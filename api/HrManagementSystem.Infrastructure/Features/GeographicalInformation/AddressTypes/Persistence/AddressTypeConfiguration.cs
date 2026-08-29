using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Persistence;

public class AddressTypeConfiguration : IEntityTypeConfiguration<AddressType>
{
    public void Configure(EntityTypeBuilder<AddressType> builder)
    {
        // Indexes
        builder.HasIndex(a => new { a.TenantId, a.CompanyId, a.NameAr }).IsUnique();
        builder.HasIndex(a => new { a.TenantId, a.CompanyId, a.NameEn }).IsUnique();

        // Properties - Apply only if have two columns for same data
        builder.Property(a => a.NameEn)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(a => a.NameAr)
               .IsRequired()
               .HasMaxLength(100);

    }
}
