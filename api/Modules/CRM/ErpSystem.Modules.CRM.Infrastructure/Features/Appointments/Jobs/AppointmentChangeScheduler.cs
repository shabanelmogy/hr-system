using ErpSystem.Modules.CRM.Application.Features.Appointments.Abstractions;

namespace ErpSystem.Modules.CRM.Infrastructure.Features.Appointments.Jobs;

public sealed class AppointmentChangeScheduler(ICurrentActor currentActor) : IAppointmentChangeScheduler
{
    public void Schedule(int appointmentId, string action)
    {
        var scope = AppointmentScope.Require(currentActor);
        var request = new AppointmentChangedJobRequest(
            appointmentId,
            action,
            scope.UserId,
            scope.TenantId,
            scope.CompanyId,
            Guid.NewGuid());

        BackgroundJob.Enqueue<AppointmentChangedJob>(
            job => job.ExecuteAsync(request, CancellationToken.None));
    }
}
