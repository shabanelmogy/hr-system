using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class CrystalReportConfiguration : IEntityTypeConfiguration<CrystalReport>
{
    public void Configure(EntityTypeBuilder<CrystalReport> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EntityKey).IsRequired().HasMaxLength(64);
        builder.Property(x => x.ReportKey).IsRequired().HasMaxLength(128);
        builder.Property(x => x.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.HasIndex(x => new { x.TenantId, x.EntityKey, x.ReportKey }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.EntityKey, x.IsDeleted, x.DisplayName });

        builder.HasMany(x => x.Versions)
            .WithOne(x => x.CrystalReport)
            .HasForeignKey(x => x.CrystalReportId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<CrystalReportVersion>()
            .WithMany()
            .HasForeignKey(x => x.CurrentPublishedVersionId)
            .OnDelete(DeleteBehavior.NoAction);
        builder.HasMany(x => x.RoleGrants)
            .WithOne(x => x.CrystalReport)
            .HasForeignKey(x => x.CrystalReportId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class CrystalReportVersionConfiguration : IEntityTypeConfiguration<CrystalReportVersion>
{
    public void Configure(EntityTypeBuilder<CrystalReportVersion> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.StorageKey).IsRequired().HasMaxLength(256);
        builder.Property(x => x.OriginalFileName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Sha256).IsRequired().HasMaxLength(64).IsFixedLength();
        builder.Property(x => x.SummaryTitle).HasMaxLength(200);
        builder.Property(x => x.SummarySubject).HasMaxLength(500);
        builder.Property(x => x.ValidationStatus).HasConversion<string>().HasMaxLength(32);
        builder.Property(x => x.ValidationReason).HasMaxLength(500);
        builder.HasIndex(x => new { x.TenantId, x.CrystalReportId, x.VersionNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.StorageKey }).IsUnique();
    }
}

public sealed class CrystalReportRoleGrantConfiguration : IEntityTypeConfiguration<CrystalReportRoleGrant>
{
    public void Configure(EntityTypeBuilder<CrystalReportRoleGrant> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.RoleId).IsRequired().HasMaxLength(450);
        builder.Property(x => x.Rights).IsRequired();
        builder.HasIndex(x => new
        {
            x.TenantId,
            x.CompanyId,
            x.CrystalReportId,
            x.RoleId
        }).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.HasOne<ApplicationRole>()
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
