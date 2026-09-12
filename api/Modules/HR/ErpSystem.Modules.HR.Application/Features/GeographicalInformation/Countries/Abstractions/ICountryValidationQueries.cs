using ErpSystem.Modules.HR.Application.Abstractions.Validation;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryValidationQueries : IValidationQuery
{
    Task<bool> CountryNameEnExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryNameArExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryAlpha2CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryAlpha3CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryExistsAsync(int id, CancellationToken cancellationToken);
}
