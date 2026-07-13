namespace HrManagementSystem.Features.Appointments.Contracts;

public record AppointmentResponse
(
     int? Id,
     DateTime Start,
     DateTime End,
     string Text
);
