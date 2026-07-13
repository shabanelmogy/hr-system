namespace HrManagementSystem.Features.Analytics.Reports.Persistence;

public class ReportMasterConfiguration : IEntityTypeConfiguration<ReportMaster>
{
    public void Configure(EntityTypeBuilder<ReportMaster> builder)
    {
        // Primary Key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.ReportName).HasMaxLength(50).IsRequired();
        builder.ToTable(tb =>
            tb.HasCheckConstraint("CHK_ReportMaster_ReportName_EnglishOnly", "[ReportName] NOT LIKE '%[^A-Za-z ]%'"));

        builder.Property(x => x.ExportedName).HasMaxLength(50).IsRequired();
        builder.ToTable(tb =>
            tb.HasCheckConstraint("CHK_ReportMaster_ExportedName_EnglishOnly", "[ExportedName] NOT LIKE '%[^A-Za-z ]%'"));

        builder.Property(x => x.ReportPath).HasMaxLength(255).IsRequired();
        builder.ToTable(tb =>
            tb.HasCheckConstraint("CHK_ReportMaster_ReportPath_EnglishOnly", "[ReportPath] NOT LIKE '%[^A-Za-z ]%'"));

        builder.Property(x => x.Logo).HasMaxLength(50).IsRequired();
        builder.ToTable(tb =>
            tb.HasCheckConstraint("CHK_ReportMaster_Logo_EnglishOnly", "[Logo] NOT LIKE '%[^A-Za-z ]%'"));

        builder.Property(x => x.ViewName).HasMaxLength(50).IsRequired();
        builder.ToTable(tb =>
            tb.HasCheckConstraint("CHK_ReportMaster_ViewName_EnglishOnly", "[ViewName] NOT LIKE '%[^A-Za-z ]%'"));

        // Relationships
        builder.HasOne(r => r.ReportCategory)
               .WithMany(r => r.ReportMasters)
               .HasForeignKey(r => r.ReportCategoryId)
               .IsRequired();

        // Indexes
        builder.HasIndex(x => x.ReportName).IsUnique();
        builder.HasIndex(x => x.ExportedName).IsUnique();
    }
}
