using HrManagementSystem.Application.Common.Paginations;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

public sealed record AttendanceDeviceRequest(string Name, string ProviderId, string Host, int Port, string TimeZoneId, int? BranchId = null, string ConnectionMode = "tcp", Guid? AttendanceAgentId = null);
public sealed record AttendanceDeviceResponse(int Id, string Name, string ProviderId, string Host, int Port, string TimeZoneId, bool Enabled, DateTime? LastSeenAtUtc, DateTime? LastPullAtUtc, bool HasCredentials, byte[] RowVersion, int? BranchId = null, string? BranchNameEn = null, string? BranchNameAr = null, string ConnectionMode = "tcp", Guid? AttendanceAgentId = null, string? AttendanceAgentName = null);
public sealed record AttendanceBranchResponse(int Id, string NameEn, string NameAr, string BranchCode);
public sealed record AttendanceAgentResponse(Guid Id, string Name, bool IsActive, DateTime? LastSeenAtUtc, int DeviceCount);
public sealed record CreateAttendanceAgentRequest(string Name);
/// <summary>Returned only at enrollment/rotation time. Persist it only on the customer-site Agent host.</summary>
public sealed record AttendanceAgentInstallConfiguration(Guid AgentId, string EnrollmentToken, string HostedApiBaseUrl, int PollIntervalSeconds);
public sealed record CreatedAttendanceAgentResponse(AttendanceAgentResponse Agent, string EnrollmentToken,
    AttendanceAgentInstallConfiguration InstallConfiguration);
public sealed record UpdateDeviceCredentialsRequest(string? Password, string? CommKey, string? Token)
{
    public override string ToString() => "Attendance device credentials [REDACTED]";
}
public sealed record SetDeviceEnabledRequest(bool Enabled);
public sealed record ProviderResponse(string ProviderId, string DisplayName, bool Available, bool Configured, bool SupportsTestConnection, bool SupportsUsers, bool SupportsAttendance, bool SupportsDetection, string? AvailabilityDetail);
public sealed record ConnectorHealthResponse(string Status, bool Available, string Architecture, IReadOnlyList<ProviderResponse> Providers);
public sealed record DetectDeviceRequest(string Host, int Port = 4370);
public sealed record DetectDeviceResponse(bool Detected, string? ProviderId, int Confidence, string Message);
public sealed record DeviceTestResponse(bool Connected, string? SerialNumber, string? FirmwareVersion, string? Platform, string? SdkVersion, string? ErrorCode, string? Message);
public sealed record StartPullRequest(DateTime? FromUtc, DateTime? ToUtc, Guid? OperationId);
public sealed record PullRunResponse(long Id, int DeviceId, string OperationType, string Status, Guid OperationId, DateTime StartedAtUtc, DateTime? FinishedAtUtc, DateTime? FromUtc, DateTime? ToUtc, int ReadCount, int InsertedCount, int DuplicateCount, int SkippedCount, int ErrorCount, string? Error);
/// <summary>Identity verified from the agent enrollment headers; never accepted from an HR browser client.</summary>
public sealed record AttendanceAgentSession(Guid AgentId, string TenantId, int CompanyId, string AuditUserId);
public sealed record AttendanceAgentHeartbeatResponse(DateTime ServerTimeUtc);
/// <summary>Private device connection details are returned only to the authenticated assigned agent over HTTPS.</summary>
public sealed record AttendanceAgentWorkItemResponse(long RunId, string OperationType, int DeviceId, string ProviderId,
    string Host, int Port, string TimeZoneId, string? CommKey, DateTime? FromUtc, DateTime? ToUtc, DateTime LeaseExpiresAtUtc);
public sealed record AttendanceAgentUser(string ExternalCode, string? Name, int Privilege, bool Enabled);
public sealed record AttendanceAgentPunch(string ExternalCode, string? Name, DateTime OccurredAtDeviceLocal,
    int VerifyMode, int InOutMode, int WorkCode, string? ProviderEventId);
public sealed record AttendanceAgentTestResult(bool Connected, string? SerialNumber, string? FirmwareVersion,
    string? Platform, string? SdkVersion, string? ErrorCode);
public sealed record SubmitAttendanceAgentWorkResultRequest(bool Succeeded, string? ErrorCode, int ReadCount = 0,
    int SkippedCount = 0, IReadOnlyList<AttendanceAgentUser>? Users = null,
    IReadOnlyList<AttendanceAgentPunch>? Punches = null, AttendanceAgentTestResult? Test = null);
public sealed record AttendanceAgentWorkResultResponse(long RunId, string Status, int InsertedCount, int DuplicateCount,
    int SkippedCount, int ErrorCount);
public sealed record RawDeviceUserResponse(long Id, int DeviceId, string DeviceName, string ExternalCode, string? Name, string? SafeRawPayload, DateTime PulledAtUtc);
public sealed record RawAttendancePunchResponse(long Id, int DeviceId, string DeviceName, string ExternalCode, string? Name, DateTime OccurredAtDeviceLocal, DateTime OccurredAtUtc, int VerifyMode, int InOutMode, int WorkCode, string? ProviderEventId, string? SafeRawPayload, DateTime PulledAtUtc);
public sealed record RawDeviceUserPageRequest(int PageNumber = 1, int PageSize = 10, string? Search = null, string SortBy = "externalCode", string SortDirection = "asc", int? DeviceId = null);
public sealed record RawAttendancePunchPageRequest(int PageNumber = 1, int PageSize = 10, int? DeviceId = null, string? ExternalCode = null, DateTime? FromUtc = null, DateTime? ToUtc = null, string SortBy = "occurredAtUtc", string SortDirection = "desc");
public sealed record PullRunPageRequest(int PageNumber = 1, int PageSize = 10, int? DeviceId = null, string? Status = null, Guid? OperationId = null, string SortBy = "startedAtUtc", string SortDirection = "desc");
