using HrManagementSystem.Domain.Platform.SecurityAudits.Entities;

namespace HrManagementSystem.Infrastructure.Features.Platform.SecurityAudits.Persistence;

public sealed class SecurityAuditEventConfiguration : IEntityTypeConfiguration<SecurityAuditEvent>
{
    public void Configure(EntityTypeBuilder<SecurityAuditEvent> builder)
    {
        builder.ToTable("SecurityAuditEvents");
        builder.HasKey(audit => audit.Id);

        builder.Property(audit => audit.TenantId).HasMaxLength(32);
        builder.Property(audit => audit.ActorUserId).HasMaxLength(450);
        builder.Property(audit => audit.Action).HasMaxLength(100).IsRequired();
        builder.Property(audit => audit.TargetType).HasMaxLength(100).IsRequired();
        builder.Property(audit => audit.TargetId).HasMaxLength(450);
        builder.Property(audit => audit.Outcome)
            .HasConversion<string>()
            .HasMaxLength(16)
            .IsRequired();
        builder.Property(audit => audit.Reason).HasMaxLength(1000);
        builder.Property(audit => audit.IpAddress).HasMaxLength(64);
        builder.Property(audit => audit.UserAgent).HasMaxLength(512);
        builder.Property(audit => audit.CorrelationId).HasMaxLength(128);
        builder.Property(audit => audit.MetadataJson).HasColumnType("nvarchar(max)");

        builder.HasIndex(audit => new { audit.TenantId, audit.OccurredOn });
        builder.HasIndex(audit => new { audit.ActorUserId, audit.OccurredOn });
        builder.HasIndex(audit => new { audit.TargetType, audit.TargetId, audit.OccurredOn });
    }
}
