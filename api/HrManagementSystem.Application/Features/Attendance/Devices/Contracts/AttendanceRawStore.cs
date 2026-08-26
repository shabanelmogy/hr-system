using HrManagementSystem.Domain.Attendance.Devices.Entities;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

public interface IAttendanceRawStore
{
    Task<DevicePullRun?> FindRunAsync(long id, CancellationToken ct);
    Task<IReadOnlyList<RawDeviceUser>> FindUsersAsync(int deviceId, IReadOnlyCollection<string> codes, CancellationToken ct);
    Task<IReadOnlyList<string>> FindPunchKeysAsync(int deviceId, IReadOnlyCollection<string> keys, CancellationToken ct);
    void Add(RawDeviceUser user);
    void Add(RawAttendancePunch punch);
    Task<DevicePullRun?> FindClaimableRunAsync(Guid agentId, DateTime nowUtc, CancellationToken ct);
}
