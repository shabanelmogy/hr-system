using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;

namespace HrManagementSystem.Features.GeographicalInformation.Districts.Services;

public interface IDistrictService
{
    Task<IEnumerable<DistrictResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<DistrictResponse>> GetAllByStateAsync(int stateId, CancellationToken cancellationToken);
    Task<Result<DistrictResponse>> GetAsync(int id, CancellationToken cancellationToken);
    Task<Result<DistrictResponse>> GetRelatedAddresses(int id, CancellationToken cancellationToken);
    Task<Result<DistrictResponse>> AddAsync(DistrictRequest district, CancellationToken cancellationToken);
    Task<Result<DistrictResponse>> UpdateAsync(DistrictRequest districtRequest, CancellationToken cancellationToken = default);
    Task<Result> ToggleAsync(int id, CancellationToken cancellationToken);
    Task<Result<DistrictsCountResponse>> GetCountAsync(CancellationToken cancellationToken = default);
}
