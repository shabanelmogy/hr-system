using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Jobs;

public sealed class AttendancePullScheduler(IBackgroundJobClient jobs) : IAttendancePullScheduler
{
    public void Schedule(AttendancePullJobRequest request) =>
        jobs.Enqueue<AttendancePullJob>(job => job.ExecuteAsync(request, CancellationToken.None));
}
