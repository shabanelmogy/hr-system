namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;

public sealed record AddressChange(
    AddressResponse Address,
    string Action,
    string? ActorUserId,
    string TenantId,
    int CompanyId,
    Guid OperationId);
