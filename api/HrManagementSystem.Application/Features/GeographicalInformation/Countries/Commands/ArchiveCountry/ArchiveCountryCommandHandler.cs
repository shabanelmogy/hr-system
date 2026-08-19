using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
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
        var country = await countryWriteStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (country is null)
            return Result.Failure(countryErrors.CountryNotFound);
        if (country.IsDeleted)
            return Result.Success();
        if (await countryWriteStore.HasActiveStatesAsync(country.Id, cancellationToken))
            return Result.Failure(countryErrors.CountryInUseByState);

        country.IsDeleted = true;
        country.DeletedById = currentActor.UserId;
        country.DeletedByPc = Environment.MachineName;
        country.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        countryChangeScheduler.Schedule(new CountryChange(
            mapper.Map<CountryDetailResponse>(country),
            "Archive",
            null,
            currentActor.UserId,
            Guid.NewGuid()));
        return Result.Success();
    }
}
