namespace HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;

public record CountriesCountResponse(
    int Count,
    CountryResponse? Country,
    string? Action
);
