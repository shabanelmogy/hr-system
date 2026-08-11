using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Application.Common.Realtime;

using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Jobs;

public sealed record CountryChangedJobRequest(
    CountryResponse? Country,
    string Action,
    int? BulkCount,
    string? ActorUserId,
    Guid OperationId);

[AutomaticRetry(Attempts = 5, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
public sealed class CountryChangedJob(
    ApplicationDbContext context,
    INotificationPublisher notificationPublisher,
    IHubContext<GeneralHub, IGeneralHubClient> hubContext)
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

        var count = await context.Countries.AsNoTracking()
            .CountAsync(country => !country.IsDeleted, cancellationToken);

        var clients = hubContext.Clients.Group(
            GeneralHubGroups.ForPermission(Permissions.ViewCountries));
        var entityId = request.Country?.Id.ToString(CultureInfo.InvariantCulture);

        await Task.WhenAll(
            clients.ReceiveCountryUpdate(
                new CountriesCountResponse(count, request.Country, request.Action)),
            clients.ReceiveEntityChanged(new RealtimeEntityChanged(
                request.OperationId,
                DateTime.UtcNow,
                RealtimeResource.For<Country>(),
                request.Action,
                entityId)));
    }
}
