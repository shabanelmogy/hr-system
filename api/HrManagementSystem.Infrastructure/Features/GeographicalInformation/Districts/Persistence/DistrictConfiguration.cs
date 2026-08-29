using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Persistence;

public class DistrictConfiguration : IEntityTypeConfiguration<District>
{
    public void Configure(EntityTypeBuilder<District> builder)
    {
        // Indexes
        builder.HasIndex(d => new { d.NameAr, d.StateId }).IsUnique();
        builder.HasIndex(d => new { d.NameEn, d.StateId }).IsUnique();
        builder.HasIndex(d => new { d.Code, d.StateId }).IsUnique();

        // Names are Unicode data. Script-specific database constraints reject valid
        // international names and belong in localized input guidance, not storage.
        builder.Property(d => d.NameEn)
                .IsRequired()
                .HasMaxLength(100);

        builder.Property(d => d.NameAr)
                .IsRequired()
                .HasMaxLength(100);

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
