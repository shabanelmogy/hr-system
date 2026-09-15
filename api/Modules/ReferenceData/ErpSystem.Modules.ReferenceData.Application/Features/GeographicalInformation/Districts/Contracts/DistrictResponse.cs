using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Contracts;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Contracts;

public record DistrictResponse(
    int Id,
    string NameAr,
    string NameEn,
    string Code,
    int StateId,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    SimpleStateResponse State,
    bool IsDeleted
);

