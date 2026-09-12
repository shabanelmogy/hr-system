using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Contracts;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Errors;
using ErpSystem.Modules.HR.Domain.GeographicalInformation.Countries.Entities;
using MapsterMapper;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;

public sealed class UpdateCountryCommandHandler(
    ICountryWriteStore countryWriteStore,
    IUnitOfWork unitOfWork,
    ICountryChangeScheduler countryChangeScheduler,
    ICountryAuditTrail countryAuditTrail,
    ICurrentActor currentActor,
    CountryErrors countryErrors,
    IMapper mapper)
    : ICommandHandler<UpdateCountryCommand, Result<CountryDetailResponse>>
{
    public async Task<Result<CountryDetailResponse>> Handle(
        UpdateCountryCommand request,
        CancellationToken cancellationToken)
    {
        var country = await countryWriteStore.GetForUpdateAsync(
            request.Id,
            cancellationToken);
        if (country is null || country.IsDeleted)
            return Result.Failure<CountryDetailResponse>(countryErrors.CountryNotFound);

        var updatedCountry = mapper.Map<Country>((CountryMutation)request);
        if (await countryWriteStore.HasAnyConflictAsync(
                [updatedCountry],
                country.Id,
                cancellationToken))
        {
            return Result.Failure<CountryDetailResponse>(countryErrors.CountryExists);
        }

        countryAuditTrail.RecordUpdate(country, updatedCountry);

        mapper.Map((CountryMutation)request, country);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = mapper.Map<CountryDetailResponse>(country);
        countryChangeScheduler.Schedule(new CountryChange(
            response,
            "Update",
            null,
            currentActor.UserId,
            Guid.NewGuid()));

        return Result.Success(response);
    }
}
