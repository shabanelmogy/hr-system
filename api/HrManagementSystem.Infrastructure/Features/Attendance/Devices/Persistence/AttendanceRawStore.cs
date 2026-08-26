using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Domain.Attendance.Devices.Entities;

namespace HrManagementSystem.Infrastructure.Features.Attendance.Devices.Persistence;

public sealed class AttendanceRawStore(ApplicationDbContext context) : IAttendanceRawStore
{
    public Task<DevicePullRun?> FindRunAsync(long id, CancellationToken ct) =>
        context.DevicePullRuns.Include(x => x.AttendanceDevice).ThenInclude(x => x.Credential)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<IReadOnlyList<RawDeviceUser>> FindUsersAsync(int deviceId, IReadOnlyCollection<string> codes, CancellationToken ct) =>
        await context.RawDeviceUsers.Where(x => x.AttendanceDeviceId == deviceId && codes.Contains(x.ExternalCode))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<string>> FindPunchKeysAsync(int deviceId, IReadOnlyCollection<string> keys, CancellationToken ct) =>
        await context.RawAttendancePunches.Where(x => x.AttendanceDeviceId == deviceId && keys.Contains(x.IdempotencyKey))
            .Select(x => x.IdempotencyKey).ToListAsync(ct);

    public Task<DevicePullRun?> FindClaimableRunAsync(Guid agentId, DateTime nowUtc, CancellationToken ct) =>
        context.DevicePullRuns.Include(x => x.AttendanceDevice).ThenInclude(x => x.Credential)
            .Where(x => x.AttendanceDevice.AttendanceAgentId == agentId &&
                (x.Status == "pending" || (x.Status == "running" && x.LeaseExpiresAtUtc < nowUtc)))
            .OrderBy(x => x.StartedAtUtc).ThenBy(x => x.Id)
            .FirstOrDefaultAsync(ct);

    public void Add(RawDeviceUser user) => context.RawDeviceUsers.Add(user);
    public void Add(RawAttendancePunch punch) => context.RawAttendancePunches.Add(punch);
}
