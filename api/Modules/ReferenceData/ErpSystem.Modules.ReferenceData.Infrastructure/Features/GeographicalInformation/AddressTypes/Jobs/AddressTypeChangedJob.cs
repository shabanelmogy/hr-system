using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;

using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Contracts;

using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.AddressTypes.Entities;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;

public sealed record AddressTypeChangedJobRequest(
    AddressTypeResponse AddressType,
    string Action,
    string? ActorUserId,
    string TenantId,
    int CompanyId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AddressTypeChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(AddressTypeChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            ReferenceDataPermissions.ViewAddressTypes,
            "GeographicalInformation",
            nameof(AddressType),
            "AddressTypes",
            request.Action,
            new Dictionary<string, string>
            {
                ["NameAr"] = request.AddressType.NameAr,
                ["NameEn"] = request.AddressType.NameEn
            },
            request.AddressType.Id.ToString(CultureInfo.InvariantCulture),
            "/basic-data/address-types",
            request.ActorUserId,
            request.OperationId,
            request.TenantId,
            request.CompanyId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"Address type notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<AddressType>(
            RealtimeAudience.ForCompanyPermission(
                request.TenantId,
                request.CompanyId,
                ReferenceDataPermissions.ViewAddressTypes),
            request.Action,
            request.AddressType.Id.ToString(CultureInfo.InvariantCulture),
            request.OperationId), cancellationToken);
    }
}
