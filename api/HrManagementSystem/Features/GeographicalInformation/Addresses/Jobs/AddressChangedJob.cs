using HrManagementSystem.Features.Platform.Notifications.Services;

using HrManagementSystem.Features.GeographicalInformation.Addresses.Contracts;

using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Jobs;

public sealed record AddressChangedJobRequest(
    AddressResponse Address,
    string Action,
    string? ActorUserId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AddressChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext)
{
    public async Task ExecuteAsync(AddressChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewAddresses,
            "GeographicalInformation",
            nameof(Address),
            "Addresses",
            request.Action,
            new Dictionary<string, string>
            {
                ["BuildingNumber"] = request.Address.BuildingNumber,
                ["PostalCode"] = request.Address.PostalCode
            },
            request.Address.Id.ToString(CultureInfo.InvariantCulture),
            null,
            request.ActorUserId,
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"Address notification failed: {result.Error.Code}");

        var count = await context.Addresses.AsNoTracking()
            .CountAsync(address => !address.IsDeleted, cancellationToken);

        await hubContext.Clients.All.ReceiveAddressUpdate(
            Result.Success(new AddressesCountResponse(count, request.Address, request.Action)));
    }
}
