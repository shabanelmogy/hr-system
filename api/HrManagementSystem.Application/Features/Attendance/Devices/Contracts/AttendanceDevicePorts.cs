using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Domain.Attendance.Devices.Entities;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

public interface IAttendanceDeviceReadStore
{
    Task<PageResponse<AttendanceDeviceResponse>> GetDevicesAsync(int pageNumber, int pageSize, string? search, CancellationToken cancellationToken);
    Task<AttendanceDeviceResponse?> GetDeviceAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<AttendanceBranchResponse>> GetBranchesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<AttendanceAgentResponse>> GetAgentsAsync(CancellationToken cancellationToken);
    Task<PageResponse<RawDeviceUserResponse>> GetUsersAsync(RawDeviceUserPageRequest request, CancellationToken cancellationToken);
    Task<PageResponse<RawAttendancePunchResponse>> GetPunchesAsync(RawAttendancePunchPageRequest request, CancellationToken cancellationToken);
    Task<PageResponse<PullRunResponse>> GetPullRunsAsync(PullRunPageRequest request, CancellationToken cancellationToken);
}
public interface IAttendanceDeviceWriteStore
{
    Task<AttendanceDevice?> FindAsync(int id, CancellationToken cancellationToken);
    Task<bool> NameExistsAsync(string normalizedName, int? exceptId, CancellationToken cancellationToken);
    Task<bool> BranchIsActiveAsync(int branchId, CancellationToken cancellationToken);
    Task<bool> HasActivePullAsync(int deviceId, CancellationToken cancellationToken);
    Task<DevicePullRun?> FindRunByOperationAsync(int deviceId, Guid operationId, CancellationToken cancellationToken);
    Task<AttendanceAgent?> FindAgentAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> AgentNameExistsAsync(string normalizedName, CancellationToken cancellationToken);
    void Add(AttendanceDevice device);
    void Add(AttendanceAgent agent);
    void Add(DevicePullRun run);
}
public interface IAttendanceCredentialProtector
{
    string Protect(UpdateDeviceCredentialsRequest request);
    UpdateDeviceCredentialsRequest Unprotect(string protectedPayload);
}
public interface IAttendanceAgentAuthenticator
{
    Task<AttendanceAgentSession?> AuthenticateAsync(Guid agentId, string enrollmentToken, CancellationToken cancellationToken);
}
public interface IAttendanceAgentInstallationSettings
{
    string HostedApiBaseUrl { get; }
    int PollIntervalSeconds { get; }
}
public interface IAttendanceNetworkPolicy
{
    bool IsAllowed(string host, int port);
}
public sealed record AttendancePullJobRequest(long RunId, string UserId, string TenantId, int CompanyId);
public interface IAttendancePullScheduler
{
    void Schedule(AttendancePullJobRequest request);
}
// Private connector boundary. Never return secrets from controllers or serialize them into job arguments.
public sealed record ConnectorEndpoint(string Host, int Port, string ProviderId, string? CommKey)
{
    public override string ToString() => "Private attendance connector endpoint [REDACTED]";
}
public sealed record ConnectorFailure(string Code, string Message, int? ProviderCode = null);
public sealed record ConnectorTestResult(bool Connected, string? SerialNumber, string? FirmwareVersion, string? Platform, string? SdkVersion, ConnectorFailure? Error);
public sealed record ConnectorUser(string ExternalCode, string? Name, int Privilege, bool Enabled);
public sealed record ConnectorPunch(string ExternalCode, string? Name, DateTime OccurredAtDeviceLocal, int VerifyMode, int InOutMode, int WorkCode, string? ProviderEventId);
public sealed record ConnectorUsersResult(int ReadCount, int SkippedCount, IReadOnlyList<ConnectorUser> Users, ConnectorFailure? Error);
public sealed record ConnectorAttendanceEndpoint(
    string Host, int Port, string ProviderId, string? CommKey, DateOnly? From, DateOnly? To)
{
    public override string ToString() => "Private attendance connector endpoint [REDACTED]";
}
public sealed record ConnectorPunchesResult(int ReadCount, int SkippedCount, IReadOnlyList<ConnectorPunch> Punches, ConnectorFailure? Error);
public interface IAttendanceConnectorClient
{
    Task<ConnectorHealthResponse> GetHealthAsync(CancellationToken cancellationToken);
    Task<DetectDeviceResponse> DetectAsync(DetectDeviceRequest request, CancellationToken cancellationToken);
    Task<ConnectorTestResult> TestAsync(ConnectorEndpoint endpoint, CancellationToken cancellationToken);
    Task<ConnectorUsersResult> PullUsersAsync(ConnectorEndpoint endpoint, CancellationToken cancellationToken);
    Task<ConnectorPunchesResult> PullAttendanceAsync(ConnectorAttendanceEndpoint endpoint, CancellationToken cancellationToken);
}
