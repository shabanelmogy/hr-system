using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class GlobalCrystalReportConfiguration : IEntityTypeConfiguration<GlobalCrystalReport>
{
    public void Configure(EntityTypeBuilder<GlobalCrystalReport> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EntityKey).IsRequired().HasMaxLength(64);
        builder.Property(x => x.ReportKey).IsRequired().HasMaxLength(128);
        builder.Property(x => x.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.ViewName).HasMaxLength(257);
        builder.Property(x => x.ViewFingerprint).HasMaxLength(64).IsFixedLength();
        builder.HasIndex(x => new { x.EntityKey, x.ReportKey }).IsUnique();
        builder.HasMany(x => x.Versions).WithOne(x => x.Report)
            .HasForeignKey(x => x.GlobalCrystalReportId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(x => x.RoleGrants).WithOne(x => x.Report)
            .HasForeignKey(x => x.GlobalCrystalReportId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<GlobalCrystalReportVersion>().WithMany()
            .HasForeignKey(x => new { x.Id, x.CurrentPublishedVersionId })
            .HasPrincipalKey(x => new { x.GlobalCrystalReportId, x.Id })
            .OnDelete(DeleteBehavior.NoAction);
        builder.ToTable("GlobalCrystalReports", table =>
        {
            table.HasCheckConstraint("CK_GlobalCrystalReports_Entity", "[EntityKey] IN ('countries','states','districts','system-error-logs')");
            table.HasCheckConstraint("CK_GlobalCrystalReports_ViewBinding",
                "([ViewName] IS NULL AND [ViewFingerprint] IS NULL) OR ([ViewName] IS NOT NULL AND [ViewFingerprint] IS NOT NULL AND LEN([ViewFingerprint]) = 64)");
        });
    }
}

public sealed class GlobalCrystalReportRoleGrantConfiguration : IEntityTypeConfiguration<GlobalCrystalReportRoleGrant>
{
    public void Configure(EntityTypeBuilder<GlobalCrystalReportRoleGrant> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.RoleId).IsRequired().HasMaxLength(450);
        builder.HasIndex(x => new { x.GlobalCrystalReportId, x.RoleId }).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.ToTable("GlobalCrystalReportRoleGrants", table => table.HasCheckConstraint(
            "CK_GlobalCrystalReportRoleGrants_Rights", "[Rights] > 0 AND [Rights] <= 15"));
    }
}

public sealed class GlobalCrystalReportVersionConfiguration : IEntityTypeConfiguration<GlobalCrystalReportVersion>
{
    public void Configure(EntityTypeBuilder<GlobalCrystalReportVersion> builder)
    {
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.GlobalCrystalReportId, x.VersionNumber }).IsUnique();
        builder.Property(x => x.StorageKey).IsRequired().HasMaxLength(256);
        builder.Property(x => x.OriginalFileName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Sha256).IsRequired().HasMaxLength(64).IsFixedLength();
        builder.Property(x => x.SummaryTitle).HasMaxLength(200);
        builder.Property(x => x.SummarySubject).HasMaxLength(500);
        builder.Property(x => x.ValidationStatus).HasConversion<string>().HasMaxLength(32);
        builder.Property(x => x.ValidationReason).HasMaxLength(500);
        builder.Property(x => x.ValidationContractFingerprint).HasMaxLength(64).IsFixedLength();
        builder.ToTable("GlobalCrystalReportVersions", table =>
        {
            table.HasCheckConstraint("CK_GlobalCrystalReportVersions_Number", "[VersionNumber] > 0 AND [Size] > 0");
            table.HasCheckConstraint("CK_GlobalCrystalReportVersions_Validation",
                "([ValidationStatus] = 'Valid' AND [ValidationContractSchemaVersion] > 0 AND LEN([ValidationContractFingerprint]) = 64) OR " +
                "([ValidationStatus] = 'Invalid' AND [ValidationContractSchemaVersion] IS NULL AND [ValidationContractFingerprint] IS NULL)");
        });
    }
}
