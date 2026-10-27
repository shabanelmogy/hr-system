using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;

public sealed class ErrorLogEntryConfiguration : IEntityTypeConfiguration<ErrorLogEntry>
{
    public void Configure(EntityTypeBuilder<ErrorLogEntry> builder)
    {
        builder.ToTable("ErrorLogEntries", PlatformDbContext.Schema);
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Source).HasMaxLength(16).IsRequired();
        builder.Property(x => x.Severity).HasMaxLength(16).IsRequired();
        builder.Property(x => x.TenantId).HasMaxLength(32);
        builder.Property(x => x.UserId).HasMaxLength(450);
        builder.Property(x => x.Service).HasMaxLength(128);
        builder.Property(x => x.Action).HasMaxLength(128);
        builder.Property(x => x.CorrelationId).HasMaxLength(128);
        builder.Property(x => x.Summary).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Client).HasMaxLength(32);
        builder.Property(x => x.Browser).HasMaxLength(32);
        builder.Property(x => x.IpAddress).HasMaxLength(45);
        builder.Property(x => x.MethodFramesJson).HasMaxLength(32768);
        builder.HasIndex(x => new { x.OccurredOnUtc, x.Id });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.OccurredOnUtc, x.Id });
        builder.HasIndex(x => new { x.Source, x.OccurredOnUtc });
    }
}

public sealed class ErrorLogRetentionSettingsConfiguration : IEntityTypeConfiguration<ErrorLogRetentionSettings>
{
    public void Configure(EntityTypeBuilder<ErrorLogRetentionSettings> builder)
    {
        builder.ToTable("ErrorLogRetentionSettings", PlatformDbContext.Schema);
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Revision).IsConcurrencyToken();
        builder.HasData(ErrorLogRetentionSettings.CreateDefault());
        builder.ToTable(table => {
            table.HasCheckConstraint("CK_ErrorLogRetentionSettings_Id", "[Id] = 1");
            table.HasCheckConstraint("CK_ErrorLogRetentionSettings_Days", "[RetentionDays] BETWEEN 1 AND 3650");
        });
    }
}
