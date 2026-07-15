using HrManagementSystem.Features.GeographicalInformation.States.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.States.Persistence;

public class StateConfiguration : IEntityTypeConfiguration<State>
{
    public void Configure(EntityTypeBuilder<State> builder)
    {
        builder.HasIndex(s => new { s.NameAr, s.CountryId }).IsUnique();
        builder.HasIndex(s => new { s.NameEn, s.CountryId }).IsUnique();
        builder.HasIndex(s => new { s.Code, s.CountryId }).IsUnique();

        builder.Property(s => s.NameEn)
            .IsRequired()
            .HasMaxLength(100);

        builder.ToTable(tb =>
            tb.HasCheckConstraint("CHK_State_NameEn_EnglishOnly", "[NameEn] NOT LIKE '%[^A-Za-z ]%'"));

        builder.Property(s => s.NameAr)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Code)
            .IsRequired()
            .HasMaxLength(10);

        builder.HasOne(s => s.Country)
            .WithMany(c => c.States)
            .HasForeignKey(s => s.CountryId)
            .IsRequired();

        builder.HasMany(s => s.Districts)
            .WithOne(d => d.State)
            .HasForeignKey(d => d.StateId)
            .IsRequired(false);
    }
}
