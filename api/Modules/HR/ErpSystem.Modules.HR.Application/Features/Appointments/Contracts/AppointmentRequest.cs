namespace ErpSystem.Modules.HR.Application.Features.Appointments.Contracts;

public record AppointmentRequest
(
     int Id,
     DateTimeOffset Start,
     DateTimeOffset End,
     string Text,
     bool IsAllDay
);
