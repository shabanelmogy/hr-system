using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Persistence;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasIndex(address => new { address.TenantId, address.CompanyId, address.AddressTypeId });
        builder.HasIndex(address => address.CountryId);
        builder.HasIndex(address => address.StateId);
        builder.HasIndex(address => address.DistrictId);
        builder.HasIndex(address => new { address.Latitude, address.Longitude });
        builder.HasAlternateKey(address => new { address.TenantId, address.CompanyId, address.Id });
        builder.Property(address => address.City)
            .HasMaxLength(150);

        builder.Property(address => address.StreetLine1)
            .HasMaxLength(250);

        builder.Property(address => address.StreetLine2)
            .HasMaxLength(250);

        builder.Property(address => address.BuildingNumber)
            .HasMaxLength(50);

        builder.Property(address => address.Floor)
            .HasMaxLength(10);

        builder.Property(address => address.ApartmentNumber)
            .HasMaxLength(20);

        builder.Property(address => address.PostalCode)
            .HasMaxLength(20);

        builder.Property(address => address.AdditionalInfo)
            .HasMaxLength(500);

        builder.Property(address => address.Latitude)
            .HasPrecision(18, 6);

        builder.Property(address => address.Longitude)
            .HasPrecision(18, 6);

        builder.ToTable(table =>
        {
            table.HasCheckConstraint(
                "CHK_Address_Latitude_Range",
                "[Latitude] IS NULL OR ([Latitude] >= -90 AND [Latitude] <= 90)");
            table.HasCheckConstraint(
                "CHK_Address_Longitude_Range",
                "[Longitude] IS NULL OR ([Longitude] >= -180 AND [Longitude] <= 180)");
            table.HasCheckConstraint(
                "CHK_Address_Coordinates_Paired",
                "([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL)");
        });

        builder.HasOne(address => address.Country)
            .WithMany(country => country.Addresses)
            .HasForeignKey(address => address.CountryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(address => address.State)
            .WithMany(state => state.Addresses)
            .HasForeignKey(address => address.StateId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(address => address.District)
            .WithMany(district => district.Addresses)
            .HasForeignKey(address => address.DistrictId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(address => address.AddressType)
            .WithMany(addressType => addressType.Addresses)
            .HasForeignKey(address => new { address.TenantId, address.CompanyId, address.AddressTypeId })
            .HasPrincipalKey(addressType => new { addressType.TenantId, addressType.CompanyId, addressType.Id })
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();
    }
}
