using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public sealed class CompanyCountry : CompanyAuditableEntity
{
    private CompanyCountry()
    {
    }

    public CompanyCountry(int countryId, bool isDefault)
    {
        if (countryId <= 0)
            throw new ArgumentOutOfRangeException(nameof(countryId));

        CountryId = countryId;
        IsDefault = isDefault;
    }

    public int Id { get; private set; }
    public int CountryId { get; private set; }
    public bool IsDefault { get; private set; }
    public Country Country { get; private set; } = null!;

    public void Activate(bool isDefault)
    {
        IsDefault = isDefault;
        IsDeleted = false;
        DeletedById = null;
        DeletedOn = null;
        DeletedByPc = null;
    }

    public void ClearDefault() => IsDefault = false;
}
