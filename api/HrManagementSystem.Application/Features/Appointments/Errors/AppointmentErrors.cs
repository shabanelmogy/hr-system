using HrManagementSystem.Application.Features.Appointments.Contracts;

namespace HrManagementSystem.Application.Features.Appointments.Errors;

public class AppointmentErrors(IStringLocalizer<AppointmentRequest> localizer)
{
    private readonly IStringLocalizer<AppointmentRequest> _localizer = localizer;

    public Error UserNotFound =>
        new("Appointment.UserNotFound", _localizer[nameof(UserNotFound)], ErrorType.NotFound);

    public Error AppointmentNotFound =>
        new("Appointment.AppointmentNotFound", _localizer[nameof(AppointmentNotFound)], ErrorType.NotFound);
}
