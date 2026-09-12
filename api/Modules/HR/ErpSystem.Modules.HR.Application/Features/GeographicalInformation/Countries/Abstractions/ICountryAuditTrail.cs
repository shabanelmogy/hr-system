using ErpSystem.Modules.HR.Domain.GeographicalInformation.Countries.Entities;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryAuditTrail
{
    void RecordUpdate(Country existingCountry, Country updatedCountry);
}
