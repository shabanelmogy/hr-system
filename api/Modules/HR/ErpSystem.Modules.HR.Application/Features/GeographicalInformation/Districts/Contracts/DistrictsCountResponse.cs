namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Contracts;

public record DistrictsCountResponse(
    int Count,
    DistrictResponse? District = null,
    string? Action = null);
