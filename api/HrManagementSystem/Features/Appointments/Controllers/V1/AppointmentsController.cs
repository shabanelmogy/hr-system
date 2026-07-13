using HrManagementSystem.Features.Appointments.Contracts;
using HrManagementSystem.Features.Appointments.Services;

namespace HrManagementSystem.Features.Appointments.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var appointments = await _appointmentService.GetAllAsync(User.GetUserId()!, cancellationToken);
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
        var result = await _appointmentService.UpdateAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.DeleteAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}

