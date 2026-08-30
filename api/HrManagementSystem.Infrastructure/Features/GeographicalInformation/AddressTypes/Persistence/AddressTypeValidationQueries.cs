using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;

namespace HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Persistence;

public sealed class AddressTypeValidationQueries(ApplicationDbContext context)
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
