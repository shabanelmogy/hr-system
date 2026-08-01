namespace HrManagementSystem.Features.Appointments.Entities;

public class Appointment : AuditableEntity
{
    public int Id { get; set; }
    public DateTimeOffset Start { get; set; }
    public DateTimeOffset End { get; set; }
    public bool IsAllDay { get; set; }
    public string Text { get; set; } = string.Empty;
}
