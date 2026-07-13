namespace HrManagementSystem.Features.Appointments.Contracts;

public record AppointmentRequest
(
     int Id,
     DateTime Start,
     DateTime End,
     string Text
);
