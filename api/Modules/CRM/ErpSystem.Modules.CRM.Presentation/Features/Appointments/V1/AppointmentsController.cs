using ErpSystem.Modules.CRM.Application.Features.Appointments.Commands;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Contracts;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Queries;
using ErpSystem.Modules.CRM.Contracts.Authorization;
using MediatR;

namespace ErpSystem.Modules.CRM.Presentation.Features.Appointments.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public class AppointmentsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(CrmPermissions.ViewAppointments)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTimeOffset? rangeStart,
        [FromQuery] DateTimeOffset? rangeEnd,
        CancellationToken cancellationToken)
    {
        var appointments = await sender.Send(
            new GetAppointmentsQuery(rangeStart, rangeEnd),
            cancellationToken);
        return Ok(appointments);
    }

    [HttpPost]
    [HasPermission(CrmPermissions.CreateAppointments)]
    public async Task<IActionResult> Add([FromBody] AppointmentRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateAppointmentCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(CrmPermissions.EditAppointments)]
    public async Task<IActionResult> Update(UpdateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateAppointmentCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete]
    [HasPermission(CrmPermissions.DeleteAppointments)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteAppointmentCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}

