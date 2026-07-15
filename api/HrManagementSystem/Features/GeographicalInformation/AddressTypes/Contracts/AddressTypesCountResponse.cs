namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;

public record AddressTypesCountResponse(
    int Count,
    AddressTypeResponse? AddressType = null,
    string? Action = null
);
