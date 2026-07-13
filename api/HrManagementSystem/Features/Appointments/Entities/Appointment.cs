namespace HrManagementSystem.Features.Appointments.Entities;

public class Appointment : AuditableEntity
{
    public int Id { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public string Text { get; set; } = string.Empty;
}
