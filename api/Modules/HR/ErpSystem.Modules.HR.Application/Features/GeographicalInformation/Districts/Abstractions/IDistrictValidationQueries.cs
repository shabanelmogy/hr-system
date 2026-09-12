using ErpSystem.Modules.HR.Application.Abstractions.Validation;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Abstractions;

public interface IDistrictValidationQueries : IValidationQuery
{
    Task<bool> DistrictNameEnExistsAsync(
        string name,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> DistrictNameArExistsAsync(
        string name,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> DistrictCodeExistsAsync(
        string code,
        int stateId,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> DistrictExistsAsync(int id, CancellationToken cancellationToken);

    Task<int?> GetStateIdAsync(int districtId, CancellationToken cancellationToken);
}
