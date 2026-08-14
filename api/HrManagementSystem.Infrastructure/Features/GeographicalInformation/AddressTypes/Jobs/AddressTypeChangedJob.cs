using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Application.Common.Realtime;

using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;

using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;

public sealed record AddressTypeChangedJobRequest(
    AddressTypeResponse AddressType,
    string Action,
    string? ActorUserId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AddressTypeChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(AddressTypeChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewAddressTypes,
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
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"Address type notification failed: {result.Error.Code}");

        var count = await context.AddressTypes.AsNoTracking()
            .CountAsync(addressType => !addressType.IsDeleted, cancellationToken);

        var clients = hubContext.Clients.Group(
            GeneralHubGroups.ForPermission(Permissions.ViewAddressTypes));

        await Task.WhenAll(
            clients.ReceiveAddressTypeUpdate(
                Result.Success(new AddressTypesCountResponse(count, request.AddressType, request.Action))),
            realtimePublisher.PublishAsync(RealtimeChangeRequest.For<AddressType>(
                RealtimeAudience.ForPermission(Permissions.ViewAddressTypes),
                request.Action,
                request.AddressType.Id.ToString(CultureInfo.InvariantCulture),
                request.OperationId), cancellationToken));
    }
}
