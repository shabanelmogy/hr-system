using HrManagementSystem.Features.GeographicalInformation.Districts.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Districts.Persistence;

public class DistrictConfiguration : IEntityTypeConfiguration<District>
{
    public void Configure(EntityTypeBuilder<District> builder)
    {
        // Indexes
        builder.HasIndex(d => new { d.NameAr, d.StateId }).IsUnique();
        builder.HasIndex(d => new { d.NameEn, d.StateId }).IsUnique();
        builder.HasIndex(d => new { d.Code, d.StateId }).IsUnique();

        // Properties - Apply constraints for Arabic and English
        builder.Property(d => d.NameEn)
                .IsRequired()
                .HasMaxLength(100);
        builder.ToTable(tb =>
                   tb.HasCheckConstraint("CHK_District_NameEn_EnglishOnly", "[NameEn] NOT LIKE '%[^A-Za-z ]%'"));

        builder.Property(d => d.NameAr)
                .IsRequired()
                .HasMaxLength(100);
        builder.ToTable(tb =>
                  tb.HasCheckConstraint("CHK_District_NameAr_ArabicOnly", "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS"));

        builder.Property(d => d.Code)
                .IsRequired()
                .HasMaxLength(10);

        // Relationships
        builder.HasOne(d => d.State)
               .WithMany(s => s.Districts)
               .HasForeignKey(d => d.StateId)
               .IsRequired();

        builder.HasMany(d => d.Addresses)
               .WithOne(a => a.District)
               .HasForeignKey(a => a.DistrictId)
               .IsRequired(false);
    }
}