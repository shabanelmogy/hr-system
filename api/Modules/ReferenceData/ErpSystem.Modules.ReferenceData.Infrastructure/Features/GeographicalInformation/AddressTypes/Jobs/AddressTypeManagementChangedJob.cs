using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.AddressTypes.Entities;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AddressTypeManagementChangedJob(INotificationPublisher notificationPublisher, IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(AddressTypeChange request, CancellationToken cancellationToken)
    {
        var parameters = request.AddressType is null ? new Dictionary<string, string> { ["Count"] = (request.BulkCount ?? 0).ToString(CultureInfo.InvariantCulture) } : new Dictionary<string, string> { ["NameAr"] = request.AddressType.NameAr, ["NameEn"] = request.AddressType.NameEn };
        var notification = NotificationPublishRequestFactory.Create(ReferenceDataPermissions.ViewAddressTypes, "GeographicalInformation", nameof(AddressType), "AddressTypes", request.Action, parameters, request.AddressType?.Id.ToString(CultureInfo.InvariantCulture), "/basic-data/address-types", request.ActorUserId, request.OperationId, request.TenantId, request.CompanyId);
        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure) throw new InvalidOperationException($"Address Type notification failed: {result.Error.Code}");
        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<AddressType>(RealtimeAudience.ForCompanyPermission(request.TenantId, request.CompanyId, ReferenceDataPermissions.ViewAddressTypes), request.Action, request.AddressType?.Id.ToString(CultureInfo.InvariantCulture), request.OperationId), cancellationToken);
    }
}
public sealed class AddressTypeChangeScheduler : IAddressTypeChangeScheduler
{
    public void Schedule(AddressTypeChange change) => BackgroundJob.Enqueue<AddressTypeManagementChangedJob>(job => job.ExecuteAsync(change, CancellationToken.None));
}
