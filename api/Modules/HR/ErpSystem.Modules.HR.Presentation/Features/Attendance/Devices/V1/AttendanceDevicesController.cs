using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Commands;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Queries;
using MediatR;

namespace ErpSystem.Modules.HR.Presentation.Features.Attendance.Devices.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/attendance-devices")]
[ApiController]
[Authorize]
public sealed class AttendanceDevicesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(HrPermissions.ViewAttendanceDevices)]
    public async Task<IActionResult> Get(int pageNumber = 1, int pageSize = 10, string? search = null, CancellationToken cancellationToken = default) => Ok(await sender.Send(new GetAttendanceDevicesQuery(pageNumber, pageSize, search), cancellationToken));

    [HttpGet("{id:int}")]
    [HasPermission(HrPermissions.ViewAttendanceDevices)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken) { var result = await sender.Send(new GetAttendanceDeviceQuery(id), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }

    [HttpPost]
    [HasPermission(HrPermissions.CreateAttendanceDevices)]
    public async Task<IActionResult> Create(AttendanceDeviceRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new CreateAttendanceDeviceCommand(request), cancellationToken); return result.IsSuccess ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value) : result.ToProblem(); }

    [HttpPut("{id:int}")]
    [HasPermission(HrPermissions.EditAttendanceDevices)]
    public async Task<IActionResult> Update(int id, UpdateAttendanceDeviceRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateAttendanceDeviceCommand(id, request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }

    [HttpPatch("{id:int}/enabled")]
    [HasPermission(HrPermissions.SetAttendanceDeviceStatus)]
    public async Task<IActionResult> SetEnabled(int id, SetDeviceEnabledRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new SetAttendanceDeviceEnabledCommand(id, request.Enabled, request.RowVersion), cancellationToken); return result.IsSuccess ? NoContent() : result.ToProblem(); }

    [HttpPut("{id:int}/credentials")]
    [HasPermission(HrPermissions.EditAttendanceDeviceCredentials)]
    public async Task<IActionResult> UpdateCredentials(int id, UpdateDeviceCredentialsRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new UpdateAttendanceDeviceCredentialsCommand(id, request), cancellationToken); return result.IsSuccess ? NoContent() : result.ToProblem(); }

    [HttpGet("providers")]
    [HasPermission(HrPermissions.ViewAttendanceDevices)]
    public Task<IReadOnlyList<ProviderResponse>> Providers(CancellationToken cancellationToken) => sender.Send(new GetAttendanceProvidersQuery(), cancellationToken);

    [HttpGet("branches")]
    [HasPermission(HrPermissions.ViewAttendanceDevices)]
    public Task<IReadOnlyList<AttendanceBranchResponse>> Branches(CancellationToken cancellationToken) =>
        sender.Send(new GetAttendanceBranchesQuery(), cancellationToken);

    [HttpGet("agents")]
    [HasPermission(HrPermissions.ViewAttendanceDevices)]
    public Task<IReadOnlyList<AttendanceAgentResponse>> Agents(CancellationToken cancellationToken) =>
        sender.Send(new GetAttendanceAgentsQuery(), cancellationToken);

    [HttpPost("agents")]
    [HasPermission(HrPermissions.CreateAttendanceAgents)]
    public async Task<IActionResult> CreateAgent(CreateAttendanceAgentRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateAttendanceAgentCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("connector/health")]
    [HasPermission(HrPermissions.ViewAttendanceDevices)]
    public Task<ConnectorHealthResponse> ConnectorHealth(CancellationToken cancellationToken) => sender.Send(new GetAttendanceConnectorHealthQuery(), cancellationToken);

    [HttpPost("detect")]
    [HasPermission(HrPermissions.DetectAttendanceDevices)]
    public async Task<IActionResult> Detect(DetectDeviceRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new DetectAttendanceDeviceCommand(request), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }

    [HttpPost("{id:int}/test")]
    [HasPermission(HrPermissions.TestAttendanceDevices)]
    public async Task<IActionResult> Test(int id, CancellationToken cancellationToken) { var result = await sender.Send(new TestAttendanceDeviceCommand(id), cancellationToken); return result.IsSuccess ? Ok(result.Value) : result.ToProblem(); }

    [HttpPost("{id:int}/pull-users")]
    [HasPermission(HrPermissions.PullAttendanceDeviceUsers)]
    public async Task<IActionResult> PullUsers(int id, StartPullRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new StartAttendanceDevicePullCommand(id, "users", request), cancellationToken); return result.IsSuccess ? Accepted(result.Value) : result.ToProblem(); }

    [HttpPost("{id:int}/pull-attendance")]
    [HasPermission(HrPermissions.PullAttendance)]
    public async Task<IActionResult> PullAttendance(int id, StartPullRequest request, CancellationToken cancellationToken) { var result = await sender.Send(new StartAttendanceDevicePullCommand(id, "attendance", request), cancellationToken); return result.IsSuccess ? Accepted(result.Value) : result.ToProblem(); }
}
