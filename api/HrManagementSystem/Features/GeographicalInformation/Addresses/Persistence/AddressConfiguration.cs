using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Persistence;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        // Indexes
        builder.HasIndex(a => a.AddressTypeId);
        builder.HasIndex(a => a.DistrictId);
        builder.HasIndex(a => new { a.Latitude, a.Longitude });

        // Properties
        builder.Property(a => a.BuildingNumber)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(a => a.Floor)
               .IsRequired()
               .HasMaxLength(10);

        builder.Property(a => a.ApartmentNumber)
               .IsRequired()
               .HasMaxLength(20);

        builder.Property(a => a.PostalCode)
               .IsRequired()
               .HasMaxLength(20);

        builder.Property(a => a.AdditionalInfo)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(a => a.Latitude)
               .IsRequired()
               .HasPrecision(18, 6);

        builder.Property(a => a.Longitude)
               .IsRequired()
               .HasPrecision(18, 6);

        builder.Property(a => a.IsDefault)
               .IsRequired()
               .HasDefaultValue(false);

        // Check constraints for geographic coordinates
        builder.ToTable(tb =>
               tb.HasCheckConstraint("CHK_Address_Latitude_Range", "[Latitude] >= -90 AND [Latitude] <= 90"));

        builder.ToTable(tb =>
               tb.HasCheckConstraint("CHK_Address_Longitude_Range", "[Longitude] >= -180 AND [Longitude] <= 180"));

        // Relationships
        builder.HasOne(a => a.AddressType)         // Address has one AddressType
               .WithMany(at => at.Addresses)       // AddressType has many Addresses
               .HasForeignKey(a => a.AddressTypeId)
               .IsRequired(true);

        builder.HasOne(a => a.District)            // Address has one District
               .WithMany(d => d.Addresses)         // District has many Addresses
               .HasForeignKey(a => a.DistrictId)
               .IsRequired(true);
    }
}