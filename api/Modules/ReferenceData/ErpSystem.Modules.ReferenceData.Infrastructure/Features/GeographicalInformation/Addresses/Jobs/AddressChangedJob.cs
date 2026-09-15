using ErpSystem.Modules.Platform.Contracts.Notifications;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;

using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;

using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Addresses.Jobs;

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AddressChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(AddressChange request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            ReferenceDataPermissions.ViewAddresses,
            "GeographicalInformation",
            nameof(Address),
            "Addresses",
            request.Action,
            new Dictionary<string, string>
            {
                ["BuildingNumber"] = request.Address.BuildingNumber ??
                                      request.Address.StreetLine1 ??
                                      request.Address.City ??
                                      request.Address.Id.ToString(CultureInfo.InvariantCulture),
                ["PostalCode"] = request.Address.PostalCode ?? string.Empty
            },
            request.Address.Id.ToString(CultureInfo.InvariantCulture),
            null,
            request.ActorUserId,
            request.OperationId,
            request.TenantId,
            request.CompanyId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"Address notification failed: {result.Error.Code}");

        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<Address>(
            RealtimeAudience.ForCompanyPermission(
                request.TenantId,
                request.CompanyId,
                ReferenceDataPermissions.ViewAddresses),
            request.Action,
            request.Address.Id.ToString(CultureInfo.InvariantCulture),
            request.OperationId), cancellationToken);
    }
}

public sealed class AddressChangeScheduler : IAddressChangeScheduler
{
    public void Schedule(AddressChange change) =>
        BackgroundJob.Enqueue<AddressChangedJob>(job => job.ExecuteAsync(change, CancellationToken.None));
}
