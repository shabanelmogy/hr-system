using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Errors;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using MapsterMapper;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;

public sealed class CreateCountryCommandHandler(
    ICountryWriteStore countryWriteStore,
    IUnitOfWork unitOfWork,
    ICountryChangeScheduler countryChangeScheduler,
    ICurrentActor currentActor,
    IMapper mapper,
    CountryErrors countryErrors)
    : ICommandHandler<CreateCountryCommand, Result<CountryDetailResponse>>
{
    public async Task<Result<CountryDetailResponse>> Handle(
        CreateCountryCommand request,
        CancellationToken cancellationToken)
    {
        var country = mapper.Map<Country>((CountryMutation)request);
        if (await countryWriteStore.HasAnyConflictAsync(
                [country],
                excludedId: null,
                cancellationToken))
        {
            return Result.Failure<CountryDetailResponse>(countryErrors.CountryExists);
        }

        countryWriteStore.Add(country);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = mapper.Map<CountryDetailResponse>(country);

        countryChangeScheduler.Schedule(new CountryChange(
            response,
            "Add",
            null,
            currentActor.UserId,
            Guid.NewGuid()));

        return Result.Success(response);
    }
}
