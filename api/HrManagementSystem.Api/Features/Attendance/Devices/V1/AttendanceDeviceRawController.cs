using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Attendance.Devices.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.Attendance.Devices.V1;

[ApiVersion("1.0")]
[ApiController]
[Authorize]
public sealed class AttendanceDeviceRawController(ISender sender) : ControllerBase
{
    [HttpGet("api/v{version:apiVersion}/attendance-device-users")]
    [HasPermission(Permissions.ViewRawAttendanceDevices)]
    public Task<PageResponse<RawDeviceUserResponse>> Users([FromQuery] RawDeviceUserPageRequest request, CancellationToken cancellationToken) => sender.Send(new GetRawDeviceUsersQuery(request), cancellationToken);

    [HttpGet("api/v{version:apiVersion}/raw-attendance-punches")]
    [HasPermission(Permissions.ViewRawAttendanceDevices)]
    public Task<PageResponse<RawAttendancePunchResponse>> Punches([FromQuery] RawAttendancePunchPageRequest request, CancellationToken cancellationToken) => sender.Send(new GetRawAttendancePunchesQuery(request), cancellationToken);

    [HttpGet("api/v{version:apiVersion}/device-pull-runs")]
    [HasPermission(Permissions.ViewRawAttendanceDevices)]
    public Task<PageResponse<PullRunResponse>> Runs([FromQuery] PullRunPageRequest request, CancellationToken cancellationToken) => sender.Send(new GetDevicePullRunsQuery(request), cancellationToken);
}
