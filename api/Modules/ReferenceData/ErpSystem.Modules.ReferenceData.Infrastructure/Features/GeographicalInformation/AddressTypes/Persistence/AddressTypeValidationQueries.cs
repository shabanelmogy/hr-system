using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Validation;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.AddressTypes.Persistence;

public sealed class AddressTypeValidationQueries(ReferenceDataDbContext context)
    : IAddressTypeValidationQueries
{
    public Task<bool> AddressTypeNameEnExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.AddressTypes.AnyAsync(
            addressType => addressType.NameEn == normalizedName &&
                           (!excludedId.HasValue || addressType.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> AddressTypeNameArExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedName = GeographicalNameRules.Normalize(name);
        return context.AddressTypes.AnyAsync(
            addressType => addressType.NameAr == normalizedName &&
                           (!excludedId.HasValue || addressType.Id != excludedId.Value),
            cancellationToken);
    }

    public Task<bool> AddressTypeExistsAsync(int id, CancellationToken cancellationToken) =>
        context.AddressTypes.AnyAsync(
            addressType => addressType.Id == id && !addressType.IsDeleted,
            cancellationToken);
}
