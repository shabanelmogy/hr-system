using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Jobs;

public sealed class CountryChangeScheduler : ICountryChangeScheduler
{
    public void Schedule(CountryChange change)
    {
        var request = new CountryChangedJobRequest(
            change.Country,
            change.Action,
            change.BulkCount,
            change.ActorUserId,
            change.OperationId);

        BackgroundJob.Enqueue<CountryChangedJob>(
            job => job.ExecuteAsync(request, CancellationToken.None));
    }
}
