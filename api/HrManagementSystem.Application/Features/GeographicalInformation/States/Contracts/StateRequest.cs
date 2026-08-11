namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;

public record StateRequest(
    int? Id,
    string NameAr,
    string NameEn,
    string Code,
    int CountryId
);
