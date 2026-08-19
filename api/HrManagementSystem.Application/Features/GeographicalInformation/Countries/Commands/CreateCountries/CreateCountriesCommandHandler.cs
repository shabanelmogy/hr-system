using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using MapsterMapper;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;

public sealed class CreateCountriesCommandHandler(
    ICountryWriteStore countryWriteStore,
    IUnitOfWork unitOfWork,
    ICountryChangeScheduler countryChangeScheduler,
    ICurrentActor currentActor,
    CountryErrors countryErrors,
    IMapper mapper)
    : ICommandHandler<CreateCountriesCommand, Result<CreateCountriesResponse>>
{
    public async Task<Result<CreateCountriesResponse>> Handle(
        CreateCountriesCommand request,
        CancellationToken cancellationToken)
    {
        if (request.Countries.Count == 0)
            return Result.Failure<CreateCountriesResponse>(countryErrors.NoCountriesProvided);

        var countries = request.Countries
            .Select(country => mapper.Map<Country>((CountryMutation)country))
            .ToList();
        if (HasDuplicates(countries.Select(country => country.NameAr)) ||
            HasDuplicates(countries.Select(country => country.NameEn)) ||
            HasDuplicates(countries.Select(country => country.Alpha2Code)) ||
            HasDuplicates(countries.Select(country => country.Alpha3Code)) ||
            await countryWriteStore.HasAnyConflictAsync(countries, excludedId: null, cancellationToken))
        {
            return Result.Failure<CreateCountriesResponse>(countryErrors.CountryExists);
        }

        countryWriteStore.AddRange(countries);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        countryChangeScheduler.Schedule(new CountryChange(
            null,
            "BulkAdd",
            countries.Count,
            currentActor.UserId,
            Guid.NewGuid()));

        return Result.Success(new CreateCountriesResponse(countries.Count));
    }

    private static bool HasDuplicates(IEnumerable<string?> values) =>
        values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .GroupBy(value => value!.Trim(), StringComparer.OrdinalIgnoreCase)
            .Any(group => group.Count() > 1);
}
