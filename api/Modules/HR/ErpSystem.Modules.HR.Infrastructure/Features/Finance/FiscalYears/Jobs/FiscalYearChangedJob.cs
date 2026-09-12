using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Finance.FiscalYears.Abstractions;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.HR.Domain.Finance.FiscalYears.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Finance.FiscalYears.Jobs;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class FiscalYearChangedJob(INotificationPublisher notificationPublisher, IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(FiscalYearChange request, CancellationToken cancellationToken)
    {
        var parameters = new Dictionary<string, string>
        {
            ["Code"] = request.FiscalYear.Code,
            ["NameAr"] = request.FiscalYear.NameAr,
            ["NameEn"] = request.FiscalYear.NameEn
        };
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewFiscalYears,
            "Finance",
            nameof(FiscalYear),
            "FiscalYears",
            request.Action,
            parameters,
            request.FiscalYear.Id.ToString(CultureInfo.InvariantCulture),
            "/finance/fiscal-years",
            request.ActorUserId,
            request.OperationId,
            request.TenantId,
            request.CompanyId);
        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure) throw new InvalidOperationException($"Fiscal year notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(
            RealtimeChangeRequest.For<FiscalYear>(
                RealtimeAudience.ForCompanyPermission(request.TenantId, request.CompanyId, Permissions.ViewFiscalYears),
                request.Action,
                request.FiscalYear.Id.ToString(CultureInfo.InvariantCulture),
                request.OperationId),
            cancellationToken);
    }
}

public sealed class FiscalYearChangeScheduler : IFiscalYearChangeScheduler
{
    public void Schedule(FiscalYearChange change) =>
        BackgroundJob.Enqueue<FiscalYearChangedJob>(job => job.ExecuteAsync(change, CancellationToken.None));
}
