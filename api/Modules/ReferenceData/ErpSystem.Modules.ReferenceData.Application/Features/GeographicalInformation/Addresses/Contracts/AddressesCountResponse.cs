namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;

public record AddressesCountResponse(
    int Count,
    AddressResponse? Address = null,
    string? Action = null);
