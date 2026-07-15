using HrManagementSystem.Features.Platform.Notifications.Services;

using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;

using HrManagementSystem.Features.GeographicalInformation.Districts.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Districts.Jobs;

public sealed record DistrictChangedJobRequest(
    DistrictResponse District,
    string Action,
    string? ActorUserId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class DistrictChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext)
{
    public async Task ExecuteAsync(DistrictChangedJobRequest request, CancellationToken cancellationToken)
    {
        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewDistricts,
            "GeographicalInformation",
            nameof(District),
            "Districts",
            request.Action,
            new Dictionary<string, string>
            {
                ["NameAr"] = request.District.NameAr,
                ["NameEn"] = request.District.NameEn,
                ["Code"] = request.District.Code
            },
            request.District.Id.ToString(CultureInfo.InvariantCulture),
            "/basic-data/districts",
            request.ActorUserId,
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"District notification failed: {result.Error.Code}");

        var count = await context.Districts.AsNoTracking()
            .CountAsync(district => !district.IsDeleted, cancellationToken);

        await hubContext.Clients.All.ReceiveDistrictUpdate(
            Result.Success(new DistrictsCountResponse(count, request.District, request.Action)));
    }
}
