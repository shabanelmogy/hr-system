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
    IRealtimeEntityPublisher realtimePublisher)
{
    public Task ExecuteAsync(
        AppointmentChangedJobRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        return realtimePublisher.PublishAsync(
            RealtimeChangeRequest.For<Appointment>(
                RealtimeAudience.ForUserCompany(
                    request.TenantId,
                    request.CompanyId,
                    request.ActorUserId),
                request.Action,
                request.AppointmentId.ToString(CultureInfo.InvariantCulture),
                request.OperationId),
            cancellationToken);
    }
}
