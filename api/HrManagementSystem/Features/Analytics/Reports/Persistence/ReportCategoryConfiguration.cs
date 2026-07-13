namespace HrManagementSystem.Features.Analytics.Reports.Persistence;

public class ReportCategoryConfiguration : IEntityTypeConfiguration<ReportCategory>
{
    public void Configure(EntityTypeBuilder<ReportCategory> builder)
    {
        // Primary Key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.Name).HasMaxLength(50).IsRequired();
        builder.ToTable(tb =>
                 tb.HasCheckConstraint("CHK_ReportCategory_Name_EnglishWithSpaces", "[Name] NOT LIKE '%[^A-Za-z ]%'"));

        // Relationships
        builder.HasMany(r => r.ReportMasters)
               .WithOne(r => r.ReportCategory)
               .HasForeignKey(r => r.ReportCategoryId)
               .IsRequired();

        // Indexes
        builder.HasIndex(x => x.Name).IsUnique();
    }
}
