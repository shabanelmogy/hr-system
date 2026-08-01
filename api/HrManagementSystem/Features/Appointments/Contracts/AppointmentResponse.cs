namespace HrManagementSystem.Features.Appointments.Contracts;

public record AppointmentResponse
(
     int Id,
     DateTimeOffset Start,
     DateTimeOffset End,
     string Text,
     bool IsAllDay
);
