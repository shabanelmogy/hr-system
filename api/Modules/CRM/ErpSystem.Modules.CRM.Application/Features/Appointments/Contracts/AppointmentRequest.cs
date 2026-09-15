namespace ErpSystem.Modules.CRM.Application.Features.Appointments.Contracts;

public record AppointmentRequest
(
     DateTimeOffset Start,
     DateTimeOffset End,
     string Text,
     bool IsAllDay
);

public sealed record UpdateAppointmentRequest
(
     int Id,
     DateTimeOffset Start,
     DateTimeOffset End,
     string Text,
     bool IsAllDay
) : AppointmentRequest(Start, End, Text, IsAllDay);
