using HrManagementSystem.Domain.Attendance.Devices.Entities;

namespace HrManagementSystem.Infrastructure.Features.Attendance.Devices.Persistence;

public sealed class AttendanceDeviceConfiguration : IEntityTypeConfiguration<AttendanceDevice>
{
    public void Configure(EntityTypeBuilder<AttendanceDevice> builder)
    {
        builder.ToTable("AttendanceDevices");
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.NormalizedName).HasMaxLength(120).IsRequired();
        builder.Property(x => x.ProviderId).HasMaxLength(48).IsRequired();
        builder.Property(x => x.ConnectionMode).HasMaxLength(16).IsRequired();
        builder.Property(x => x.Host).HasMaxLength(253).IsRequired();
        builder.Property(x => x.TimeZoneId).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.AttendanceAgentId });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NormalizedName }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Enabled });
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });
        builder.HasOne(x => x.Branch).WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.BranchId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Credential).WithOne(x => x.AttendanceDevice)
            .HasForeignKey<DeviceCredential>(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId })
            .HasPrincipalKey<AttendanceDevice>(x => new { x.TenantId, x.CompanyId, x.Id }).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.AttendanceAgent).WithMany(x => x.Devices)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.AttendanceAgentId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class AttendanceAgentConfiguration : IEntityTypeConfiguration<AttendanceAgent>
{
    public void Configure(EntityTypeBuilder<AttendanceAgent> builder)
    {
        builder.ToTable("AttendanceAgents");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.NormalizedName).HasMaxLength(120).IsRequired();
        builder.Property(x => x.SecretHash).HasMaxLength(64).IsRequired();
        builder.Property(x => x.SecretPrefix).HasMaxLength(16).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NormalizedName }).IsUnique();
        builder.HasIndex(x => x.SecretHash).IsUnique();
    }
}

public sealed class DeviceCredentialConfiguration : IEntityTypeConfiguration<DeviceCredential>
{
    public void Configure(EntityTypeBuilder<DeviceCredential> builder)
    {
        builder.ToTable("AttendanceDeviceCredentials");
        builder.Property(x => x.ProtectedPayload).HasMaxLength(16000).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId }).IsUnique();
    }
}

public sealed class RawDeviceUserConfiguration : IEntityTypeConfiguration<RawDeviceUser>
{
    public void Configure(EntityTypeBuilder<RawDeviceUser> builder)
    {
        builder.ToTable("RawDeviceUsers");
        builder.Property(x => x.ExternalCode).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(256);
        builder.Property(x => x.SafeRawPayload).HasMaxLength(4000);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId, x.ExternalCode }).IsUnique();
        builder.HasOne(x => x.AttendanceDevice).WithMany(x => x.RawUsers)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id }).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class RawAttendancePunchConfiguration : IEntityTypeConfiguration<RawAttendancePunch>
{
    public void Configure(EntityTypeBuilder<RawAttendancePunch> builder)
    {
        builder.ToTable("RawAttendancePunches");
        builder.Property(x => x.ExternalCode).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(256);
        builder.Property(x => x.ProviderEventId).HasMaxLength(256);
        builder.Property(x => x.IdempotencyKey).HasMaxLength(128).IsRequired();
        builder.Property(x => x.SafeRawPayload).HasMaxLength(4000);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId, x.IdempotencyKey }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId, x.OccurredAtUtc });
        builder.HasOne(x => x.AttendanceDevice).WithMany(x => x.RawPunches)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id }).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class DevicePullRunConfiguration : IEntityTypeConfiguration<DevicePullRun>
{
    public void Configure(EntityTypeBuilder<DevicePullRun> builder)
    {
        builder.ToTable("DevicePullRuns");
        builder.Property(x => x.OperationType).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(24).IsRequired();
        builder.Property(x => x.SafeError).HasMaxLength(1000);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId, x.OperationId }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status, x.StartedAtUtc });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.ClaimedByAttendanceAgentId, x.LeaseExpiresAtUtc });
        builder.HasOne(x => x.AttendanceDevice).WithMany(x => x.PullRuns)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id }).OnDelete(DeleteBehavior.Restrict);
    }
}
