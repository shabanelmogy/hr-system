using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryAuditTrail
{
    void RecordUpdate(Country existingCountry, Country updatedCountry);
}
