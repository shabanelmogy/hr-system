using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using MapsterMapper;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.RestoreCountry;

public sealed class RestoreCountryCommandHandler(
    ICountryWriteStore countryWriteStore,
    IUnitOfWork unitOfWork,
    ICountryChangeScheduler countryChangeScheduler,
    ICurrentActor currentActor,
    CountryErrors countryErrors,
    IMapper mapper)
    : ICommandHandler<RestoreCountryCommand, Result>
{
    public async Task<Result> Handle(RestoreCountryCommand request, CancellationToken cancellationToken)
    {
        var country = await countryWriteStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (country is null)
            return Result.Failure(countryErrors.CountryNotFound);
        if (!country.IsDeleted)
            return Result.Success();

        country.IsDeleted = false;
        country.DeletedById = null;
        country.DeletedByPc = null;
        country.DeletedOn = null;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        countryChangeScheduler.Schedule(new CountryChange(
            mapper.Map<CountryDetailResponse>(country),
            "Restore",
            null,
            currentActor.UserId,
            Guid.NewGuid()));
        return Result.Success();
    }
}
