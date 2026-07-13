using HrManagementSystem.Features.Appointments.Contracts;

namespace HrManagementSystem.Features.Appointments.Errors;

public class AppointmentErrors(IStringLocalizer<AppointmentRequest> localizer)
{
    private readonly IStringLocalizer<AppointmentRequest> _localizer = localizer;

    public Error UserNotFound =>
        new("Appointment.UserNotFound", _localizer[nameof(UserNotFound)], StatusCodes.Status404NotFound);

    public Error AppointmentNotFound =>
        new("Appointment.AppointmentNotFound", _localizer[nameof(AppointmentNotFound)], StatusCodes.Status404NotFound);
}
