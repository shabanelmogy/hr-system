namespace HrManagementSystem.AttendanceConnector.Models;

public record DeviceEndpointRequest(
    string Host,
    int Port = 4370,
    string ProviderId = "zkteco-com",
    string? CommKey = null,
    int? TimeoutSeconds = null);

public sealed record PullAttendanceRequest(
    string Host,
    int Port = 4370,
    string ProviderId = "zkteco-com",
    string? CommKey = null,
    int? TimeoutSeconds = null,
    DateOnly? From = null,
    DateOnly? To = null) : DeviceEndpointRequest(Host, Port, ProviderId, CommKey, TimeoutSeconds);

public sealed record ConnectorError(string Code, string Message, int? ProviderCode = null);

public sealed record DeviceInfo(
    string? SerialNumber,
    string? FirmwareVersion,
    string? Platform,
    string? SdkVersion);

public sealed record TestResult(bool Connected, DeviceInfo? Device, ConnectorError? Error = null);

public sealed record RawDeviceUser(string ExternalCode, string Name, int Privilege, bool Enabled);

public sealed record RawAttendancePunch(
    string ExternalCode,
    string Name,
    DateTime OccurredAtDeviceLocal,
    int VerifyMode,
    int InOutMode,
    int WorkCode,
    string? ProviderEventId = null);

public sealed record PullUsersResult(
    DeviceInfo? Device,
    DateTimeOffset? PulledAt,
    int ReadCount,
    int SkippedCount,
    IReadOnlyList<RawDeviceUser> Users,
    ConnectorError? Error = null);

public sealed record PullAttendanceResult(
    DeviceInfo? Device,
    DateTimeOffset? PulledAt,
    DateOnly? From,
    DateOnly? To,
    int ReadCount,
    int SkippedCount,
    IReadOnlyList<RawAttendancePunch> Punches,
    ConnectorError? Error = null);

public sealed record ProviderInfo(
    string ProviderId,
    string DisplayName,
    bool Available,
    bool Configured,
    bool SupportsTestConnection,
    bool SupportsUsers,
    bool SupportsAttendance,
    bool SupportsDetection,
    string? AvailabilityDetail);

public sealed record ConnectorHealth(
    string Status,
    bool SdkAvailable,
    string Architecture,
    string? SdkVersion,
    IReadOnlyList<ProviderInfo> Providers);

public sealed record DetectResult(bool Detected, string? ProviderId, int Confidence, string Message);

public sealed record ConnectorFailure(ConnectorError Error);
