using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Persistence;

public class AddressTypeConfiguration : IEntityTypeConfiguration<AddressType>
{
    public void Configure(EntityTypeBuilder<AddressType> builder)
    {
        // Indexes
        builder.HasIndex(a => a.NameAr).IsUnique();
        builder.HasIndex(a => a.NameEn).IsUnique();

        // Properties - Apply only if have two columns for same data
        builder.Property(a => a.NameEn)
               .IsRequired()
               .HasMaxLength(100);
        builder.ToTable(tb =>
                   tb.HasCheckConstraint("CHK_AddressType_NameEn_EnglishOnly", "[NameEn] NOT LIKE '%[^A-Za-z ]%'"));

        builder.Property(a => a.NameAr)
               .IsRequired()
               .HasMaxLength(100);
        builder.ToTable(tb =>
                  tb.HasCheckConstraint("CHK_AddressType_NameAr_ArabicOnly", "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS"));

        // Relationships
        builder.HasMany(a => a.Addresses)         // AddressType has many Addresses
               .WithOne(addr => addr.AddressType) // Address has one AddressType
               .HasForeignKey(addr => addr.AddressTypeId)
               .IsRequired(true);
    }
}