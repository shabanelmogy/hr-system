using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;

public sealed class BulkArchiveCountriesCommandHandler(
    ICountryWriteStore countryWriteStore,
    IUnitOfWork unitOfWork,
    ICountryChangeScheduler countryChangeScheduler,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    CountryErrors countryErrors)
    : ICommandHandler<BulkArchiveCountriesCommand, Result<BulkArchiveCountriesResponse>>
{
    public async Task<Result<BulkArchiveCountriesResponse>> Handle(
        BulkArchiveCountriesCommand request,
        CancellationToken cancellationToken)
    {
        CountryChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            request.Ids.Select(GeographicalLifecycleLocks.Country).ToArray(),
            async token =>
            {
                var countries = await countryWriteStore.GetForUpdateAsync(request.Ids, token);
                if (countries.Count != request.Ids.Count)
                    return Result.Failure<BulkArchiveCountriesResponse>(countryErrors.CountryNotFound);

                var activeCountries = countries.Where(country => !country.IsDeleted).ToList();
                if (activeCountries.Count == 0)
                    return Result.Success(new BulkArchiveCountriesResponse(0));

                var activeIds = activeCountries.Select(country => country.Id).ToList();
                if (await countryWriteStore.HasActiveStatesAsync(activeIds, token))
                    return Result.Failure<BulkArchiveCountriesResponse>(countryErrors.CountryInUseByState);

                var deletedOn = timeProvider.GetUtcNow().UtcDateTime;
                foreach (var country in activeCountries)
                {
                    country.IsDeleted = true;
                    country.DeletedById = currentActor.UserId;
                    country.DeletedByPc = Environment.MachineName;
                    country.DeletedOn = deletedOn;
                }

                await unitOfWork.SaveChangesAsync(token);
                change = new CountryChange(
                    null,
                    "BulkArchive",
                    activeCountries.Count,
                    currentActor.UserId,
                    Guid.NewGuid());

                return Result.Success(new BulkArchiveCountriesResponse(activeCountries.Count));
            },
            cancellationToken);

        if (change is not null)
            countryChangeScheduler.Schedule(change);

        return result;
    }
}
