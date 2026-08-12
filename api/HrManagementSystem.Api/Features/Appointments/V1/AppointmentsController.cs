using HrManagementSystem.Application.Features.Appointments.Contracts;
using HrManagementSystem.Application.Features.Appointments.Services;

namespace HrManagementSystem.Api.Features.Appointments.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTimeOffset? rangeStart,
        [FromQuery] DateTimeOffset? rangeEnd,
        CancellationToken cancellationToken)
    {
        var appointments = await _appointmentService.GetAllAsync(
            User.GetUserId()!,
            rangeStart,
            rangeEnd,
            cancellationToken);
        return Ok(appointments);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AppointmentRequest request, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.AddAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    public async Task<IActionResult> Update(AppointmentRequest request, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.UpdateAsync(request, User.GetUserId()!, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.DeleteAsync(id, User.GetUserId()!, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}

