using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryAuditTrail
{
    Task RecordUpdateAsync(Country existingCountry, Country updatedCountry, CancellationToken cancellationToken);
}
