using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Domain.Appointments.Entities;

namespace HrManagementSystem.Infrastructure.Features.Appointments.Jobs;

public sealed record AppointmentChangedJobRequest(
    int AppointmentId,
    string Action,
    string ActorUserId,
    string TenantId,
    int CompanyId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AppointmentChangedJob(
    IHubContext<GeneralHub, IGeneralHubClient> hubContext)
{
    public Task ExecuteAsync(
        AppointmentChangedJobRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        return hubContext.Clients.Group(GeneralHubGroups.ForUserCompany(
                request.TenantId,
                request.CompanyId,
                request.ActorUserId))
            .ReceiveEntityChanged(new RealtimeEntityChanged(
                request.OperationId,
                DateTime.UtcNow,
                RealtimeResource.For<Appointment>(),
                request.Action,
                request.AppointmentId.ToString(CultureInfo.InvariantCulture)));
    }
}
