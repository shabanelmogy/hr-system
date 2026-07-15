using HrManagementSystem.Features.Analytics.Reports.Entities;

namespace HrManagementSystem.Features.Analytics.Reports.Persistence;

public class ReportdetailConfiguration : IEntityTypeConfiguration<ReportDetail>
{
    public void Configure(EntityTypeBuilder<ReportDetail> builder)
    {
        // Primary Key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.PropertyName).HasMaxLength(100).IsRequired();
        builder.ToTable(tb =>
             tb.HasCheckConstraint("CHK_ReportDetail_PropertyName_EnglishOnly", "[PropertyName] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS"));
        builder.Property(x => x.ColumnName).HasMaxLength(100).IsRequired();
        builder.ToTable(tb =>
             tb.HasCheckConstraint("CHK_ReportDetail_ColumnName_EnglishOnly", "[ColumnName] NOT LIKE '%[^A-Za-z ]%'"));

        // Relationships
        builder.HasOne(r => r.ReportMaster)
               .WithMany(r => r.ReportDetails)
               .HasForeignKey(r => r.ReportMasterId)
               .IsRequired();
    }
}
