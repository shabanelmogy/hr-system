using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Queries;
using MediatR;

namespace ErpSystem.Modules.HR.Presentation.Features.Attendance.Devices.V1;

[ApiVersion("1.0")]
[ApiController]
[Authorize]
public sealed class AttendanceDeviceRawController(ISender sender) : ControllerBase
{
    [HttpGet("api/v{version:apiVersion}/attendance-device-users")]
    [HasPermission(HrPermissions.ViewRawAttendanceDevices)]
    public Task<PageResponse<RawDeviceUserResponse>> Users([FromRoute] string version, [FromQuery] RawDeviceUserPageRequest request, CancellationToken cancellationToken) => sender.Send(new GetRawDeviceUsersQuery(request), cancellationToken);

    [HttpGet("api/v{version:apiVersion}/raw-attendance-punches")]
    [HasPermission(HrPermissions.ViewRawAttendanceDevices)]
    public Task<PageResponse<RawAttendancePunchResponse>> Punches([FromRoute] string version, [FromQuery] RawAttendancePunchPageRequest request, CancellationToken cancellationToken) => sender.Send(new GetRawAttendancePunchesQuery(request), cancellationToken);

    [HttpGet("api/v{version:apiVersion}/device-pull-runs")]
    [HasPermission(HrPermissions.ViewRawAttendanceDevices)]
    public Task<PageResponse<PullRunResponse>> Runs([FromRoute] string version, [FromQuery] PullRunPageRequest request, CancellationToken cancellationToken) => sender.Send(new GetDevicePullRunsQuery(request), cancellationToken);
}
