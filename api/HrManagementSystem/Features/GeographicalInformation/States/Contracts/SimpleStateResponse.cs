namespace HrManagementSystem.Features.GeographicalInformation.States.Contracts;

public record SimpleStateResponse(
    int Id,
    string NameAr,
    string NameEn,
    bool IsDeleted);
