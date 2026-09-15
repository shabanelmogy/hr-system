namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Contracts;

public record DistrictRequest(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int StateId
);
