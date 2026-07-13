using HrManagementSystem.Features.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Countries.Persistence;

public class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        builder.HasIndex(c => c.NameAr).IsUnique();
        builder.HasIndex(c => c.NameEn).IsUnique();
        builder.HasIndex(c => c.Alpha2Code)
            .IsUnique()
            .HasFilter("[Alpha2Code] IS NOT NULL");
        builder.HasIndex(c => c.Alpha3Code)
            .IsUnique()
            .HasFilter("[Alpha3Code] IS NOT NULL");

        builder.Property(c => c.NameEn)
            .IsRequired()
            .HasMaxLength(100);
        builder.Property(c => c.NameAr)
            .IsRequired()
            .HasMaxLength(100);
        builder.Property(c => c.Alpha2Code)
            .HasMaxLength(2);
        builder.Property(c => c.Alpha3Code)
            .HasMaxLength(3);
        builder.Property(c => c.PhoneCode)
            .HasMaxLength(10);
        builder.Property(c => c.CurrencyCode)
            .HasMaxLength(3);

        builder.HasMany(c => c.States)
            .WithOne(s => s.Country)
            .HasForeignKey(s => s.CountryId)
            .IsRequired();
    }
}
