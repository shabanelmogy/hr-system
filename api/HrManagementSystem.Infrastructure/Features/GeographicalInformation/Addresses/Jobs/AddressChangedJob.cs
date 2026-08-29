using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Application.Common.Realtime;

using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;

using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Jobs;

public sealed record AddressChangedJobRequest(
    AddressResponse Address,
    string Action,
    string? ActorUserId,
    string TenantId,
    int CompanyId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class AddressChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext,
    IRealtimeEntityPublisher realtimePublisher)
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

        var count = await context.Addresses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .CountAsync(address =>
                address.TenantId == request.TenantId &&
                address.CompanyId == request.CompanyId &&
                !address.IsDeleted,
                cancellationToken);

        var clients = hubContext.Clients.Group(GeneralHubGroups.ForCompanyPermission(
            request.TenantId,
            request.CompanyId,
            Permissions.ViewAddresses));

        await Task.WhenAll(
            clients.ReceiveAddressUpdate(
                Result.Success(new AddressesCountResponse(count, request.Address, request.Action))),
            realtimePublisher.PublishAsync(RealtimeChangeRequest.For<Address>(
                RealtimeAudience.ForCompanyPermission(
                    request.TenantId,
                    request.CompanyId,
                    Permissions.ViewAddresses),
                request.Action,
                request.Address.Id.ToString(CultureInfo.InvariantCulture),
                request.OperationId), cancellationToken));
    }
}
