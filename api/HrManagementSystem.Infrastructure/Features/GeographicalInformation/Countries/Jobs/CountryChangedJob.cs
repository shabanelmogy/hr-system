using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Application.Common.Realtime;

using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Jobs;

public sealed record CountryChangedJobRequest(
    CountryDetailResponse? Country,
    string Action,
    int? BulkCount,
    string? ActorUserId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class CountryChangedJob(
    INotificationPublisher notificationPublisher,
    IRealtimeEntityPublisher realtimePublisher)
{
    public async Task ExecuteAsync(CountryChangedJobRequest request, CancellationToken cancellationToken)
    {
        var parameters = request.Country is null
            ? new Dictionary<string, string>
            {
                ["Count"] = (request.BulkCount ?? 0).ToString(CultureInfo.InvariantCulture)
            }
            : new Dictionary<string, string>
            {
                ["NameAr"] = request.Country.NameAr,
                ["NameEn"] = request.Country.NameEn
            };

        var notification = NotificationPublishRequestFactory.Create(
            Permissions.ViewCountries,
            "GeographicalInformation",
            nameof(Country),
            "Countries",
            request.Action,
            parameters,
            request.Country?.Id.ToString(CultureInfo.InvariantCulture),
            "/basic-data/countries",
            request.ActorUserId,
            request.OperationId);

        var result = await notificationPublisher.PublishToPermissionAsync(notification, cancellationToken);
        if (result.IsFailure)
            throw new InvalidOperationException($"Country notification failed: {result.Error.Code}");

        var entityId = request.Country?.Id.ToString(CultureInfo.InvariantCulture);

        await realtimePublisher.PublishAsync(RealtimeChangeRequest.For<Country>(
            RealtimeAudience.ForPermission(Permissions.ViewCountries),
            request.Action,
            entityId,
            request.OperationId), cancellationToken);
    }
}
