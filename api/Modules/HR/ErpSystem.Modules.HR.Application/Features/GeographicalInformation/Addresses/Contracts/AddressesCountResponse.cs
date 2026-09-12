namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Addresses.Contracts;

public record AddressesCountResponse(
    int Count,
    AddressResponse? Address = null,
    string? Action = null);
