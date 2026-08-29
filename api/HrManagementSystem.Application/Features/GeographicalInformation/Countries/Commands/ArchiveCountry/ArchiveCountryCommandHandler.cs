using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using MapsterMapper;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.ArchiveCountry;

public sealed class ArchiveCountryCommandHandler(
    ICountryWriteStore countryWriteStore,
    IUnitOfWork unitOfWork,
    ICountryChangeScheduler countryChangeScheduler,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    CountryErrors countryErrors,
    IMapper mapper)
    : ICommandHandler<ArchiveCountryCommand, Result>
{
    public async Task<Result> Handle(ArchiveCountryCommand request, CancellationToken cancellationToken)
    {
        CountryChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [GeographicalLifecycleLocks.Country(request.Id)],
            async token =>
            {
                var country = await countryWriteStore.GetForUpdateAsync(request.Id, token);
                if (country is null)
                    return Result.Failure(countryErrors.CountryNotFound);
                if (country.IsDeleted)
                    return Result.Success();
                if (await countryWriteStore.HasActiveStatesAsync(country.Id, token))
                    return Result.Failure(countryErrors.CountryInUseByState);
                if (await countryWriteStore.HasActiveAddressesAsync(country.Id, token))
                    return Result.Failure(countryErrors.CountryInUseByAddress);

                country.IsDeleted = true;
                country.DeletedById = currentActor.UserId;
                country.DeletedByPc = Environment.MachineName;
                country.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
                await unitOfWork.SaveChangesAsync(token);

                change = new CountryChange(
                    mapper.Map<CountryDetailResponse>(country),
                    "Archive",
                    null,
                    currentActor.UserId,
                    Guid.NewGuid());
                return Result.Success();
            },
            cancellationToken);

        if (change is not null)
            countryChangeScheduler.Schedule(change);

        return result;
    }
}
