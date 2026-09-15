using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Commands;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;
using MediatR;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Jobs;

/// <summary>Runs with the initiating tenant/company context, never an ambient super-admin context.</summary>
[AutomaticRetry(Attempts = 3, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AttendancePullJob(ICurrentActorScope actorScope, ISender sender)
{
    [DisableConcurrentExecution(timeoutInSeconds: 600)]
    public async Task ExecuteAsync(AttendancePullJobRequest request, CancellationToken cancellationToken)
    {
        using var scope = actorScope.BeginScope(request.UserId, request.TenantId, request.CompanyId);
        await sender.Send(new ExecuteAttendancePullCommand(request.RunId), cancellationToken);
    }
}
