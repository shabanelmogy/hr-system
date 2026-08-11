using HrManagementSystem.Domain.Common.Exceptions;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Appointments.Entities;

public class Appointment : CompanyAuditableEntity
{
    private Appointment()
    {
    }

    public Appointment(DateTimeOffset start, DateTimeOffset end, string text, bool isAllDay)
    {
        UpdateText(text);
        Reschedule(start, end, isAllDay);
    }

    public int Id { get; private set; }
    public DateTimeOffset Start { get; private set; }
    public DateTimeOffset End { get; private set; }
    public bool IsAllDay { get; private set; }
    public string Text { get; private set; } = string.Empty;

    public void UpdateText(string text)
    {
        var normalizedText = Required(text, nameof(text));
        if (normalizedText.Length is < 3 or > 200)
        {
            throw new DomainRuleException(
                "Appointments.Appointment.InvalidTextLength",
                "Appointment text must contain between 3 and 200 characters.");
        }

        Text = normalizedText;
    }

    public void Reschedule(DateTimeOffset start, DateTimeOffset end, bool isAllDay)
    {
        if (end <= start)
        {
            throw new DomainRuleException(
                "Appointments.Appointment.InvalidSchedule",
                "An appointment must end after it starts.");
        }

        Start = start;
        End = end;
        IsAllDay = isAllDay;
    }
}
