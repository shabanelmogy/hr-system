using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.CRM.Domain.Appointments.Entities;

namespace ErpSystem.Modules.CRM.Tests;

public sealed class CrmDomainHardeningTests
{
    [Fact]
    public void Appointment_RejectsInvalidSchedule()
    {
        var start = new DateTimeOffset(new DateTime(2026, 8, 11, 10, 0, 0, DateTimeKind.Utc));

        Assert.Throws<DomainRuleException>(() =>
            new Appointment(start, start, "Interview", false));
    }
}
