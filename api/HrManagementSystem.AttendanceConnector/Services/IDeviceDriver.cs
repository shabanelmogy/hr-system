using HrManagementSystem.AttendanceConnector.Models;

namespace HrManagementSystem.AttendanceConnector.Services;

/// <summary>Stable, code-registered boundary for read-only device providers.</summary>
public interface IDeviceDriver
{
    string ProviderId { get; }
    ProviderInfo GetInfo();
    Task<TestResult> TestConnectionAsync(DeviceEndpointRequest request, CancellationToken cancellationToken);
    Task<PullUsersResult> PullUsersAsync(DeviceEndpointRequest request, CancellationToken cancellationToken);
    Task<PullAttendanceResult> PullAttendanceAsync(PullAttendanceRequest request, CancellationToken cancellationToken);
    Task<DetectResult> DetectAsync(DeviceEndpointRequest request, CancellationToken cancellationToken);
}
