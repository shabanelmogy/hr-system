namespace HrManagementSystem.Domain.Attendance.Devices.Entities;

/// <summary>Company-owned connection metadata for a read-only attendance device.</summary>
public sealed class AttendanceDevice : CompanyAuditableEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string NormalizedName { get; set; } = null!;
    public string ProviderId { get; set; } = null!;
    public string ConnectionMode { get; set; } = "tcp";
    public string Host { get; set; } = null!;
    public int Port { get; set; }
    public string TimeZoneId { get; set; } = null!;
    public bool Enabled { get; set; } = true;
    /// <summary>Customer-site agent that can access this device's private network.</summary>
    public Guid? AttendanceAgentId { get; set; }
    public AttendanceAgent? AttendanceAgent { get; set; }
    // User-selected association, not an authentication scope or token claim.
    public int? BranchId { get; set; }
    public HrManagementSystem.Domain.OrganizationalStructure.Entities.Branch? Branch { get; set; }
    public DateTime? LastSeenAtUtc { get; set; }
    public DateTime? LastPullAtUtc { get; set; }
    public DeviceCredential? Credential { get; set; }
    public ICollection<RawDeviceUser> RawUsers { get; set; } = [];
    public ICollection<RawAttendancePunch> RawPunches { get; set; } = [];
    public ICollection<DevicePullRun> PullRuns { get; set; } = [];
}

/// <summary>
/// A revocable, company-scoped Windows agent installed on a customer site.
/// The one-time enrollment secret is stored only as a hash and is never returned.
/// </summary>
public sealed class AttendanceAgent : CompanyAuditableEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string NormalizedName { get; set; } = null!;
    public string SecretHash { get; set; } = null!;
    public string SecretPrefix { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public DateTime? LastSeenAtUtc { get; set; }
    public ICollection<AttendanceDevice> Devices { get; set; } = [];
}

public sealed class DeviceCredential : CompanyAuditableEntity
{
    public int Id { get; set; }
    public int AttendanceDeviceId { get; set; }
    /// <summary>Data Protection protected JSON; never returned from API or audit metadata.</summary>
    public string ProtectedPayload { get; set; } = null!;
    public AttendanceDevice AttendanceDevice { get; set; } = null!;
}

public sealed class RawDeviceUser : CompanyAuditableEntity
{
    public long Id { get; set; }
    public int AttendanceDeviceId { get; set; }
    public string ExternalCode { get; set; } = null!;
    public string? Name { get; set; }
    public string? SafeRawPayload { get; set; }
    public DateTime PulledAtUtc { get; set; }
    public AttendanceDevice AttendanceDevice { get; set; } = null!;
}

public sealed class RawAttendancePunch : CompanyAuditableEntity
{
    public long Id { get; set; }
    public int AttendanceDeviceId { get; set; }
    public string ExternalCode { get; set; } = null!;
    public string? Name { get; set; }
    public DateTime OccurredAtDeviceLocal { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    public int VerifyMode { get; set; }
    public int InOutMode { get; set; }
    public int WorkCode { get; set; }
    public string? ProviderEventId { get; set; }
    public string IdempotencyKey { get; set; } = null!;
    public string? SafeRawPayload { get; set; }
    public DateTime PulledAtUtc { get; set; }
    public AttendanceDevice AttendanceDevice { get; set; } = null!;
}

public sealed class DevicePullRun : CompanyAuditableEntity
{
    public long Id { get; set; }
    public int AttendanceDeviceId { get; set; }
    public string OperationType { get; set; } = null!;
    public string Status { get; set; } = null!;
    public Guid OperationId { get; set; }
    public DateTime StartedAtUtc { get; set; }
    public DateTime? FinishedAtUtc { get; set; }
    public DateTime? FromUtc { get; set; }
    public DateTime? ToUtc { get; set; }
    public int ReadCount { get; set; }
    public int InsertedCount { get; set; }
    public int DuplicateCount { get; set; }
    public int SkippedCount { get; set; }
    public int ErrorCount { get; set; }
    public string? SafeError { get; set; }
    /// <summary>Agent that currently owns the short-lived execution lease.</summary>
    public Guid? ClaimedByAttendanceAgentId { get; set; }
    public DateTime? LeaseExpiresAtUtc { get; set; }
    public int AttemptCount { get; set; }
    public AttendanceDevice AttendanceDevice { get; set; } = null!;
}
