using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.Employees.Entities;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Company : TenantAuditableEntity
{
    private Company()
    {
    }

    public Company(
        string companyCode,
        string nameEn,
        string nameAr,
        string defaultCurrencyCode,
        string timeZoneId)
    {
        UpdateIdentity(companyCode, nameEn, nameAr, defaultCurrencyCode, timeZoneId);
        IsActive = true;
    }

    public int Id { get; private set; }
    public string CompanyCode { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string? LegalName { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? TaxNumber { get; set; }
    public int? RegistrationCountryId { get; private set; }
    public Country? RegistrationCountry { get; private set; }
    public string DefaultCurrencyCode { get; private set; } = "USD";
    public string TimeZoneId { get; private set; } = "UTC";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Logo { get; set; }
    public string? Background { get; set; }
    public bool IsActive { get; private set; }

    public ICollection<Branch> Branches { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];
    public ICollection<CompanyAddress> Addresses { get; set; } = [];

    public void UpdateIdentity(
        string companyCode,
        string nameEn,
        string nameAr,
        string defaultCurrencyCode,
        string timeZoneId)
    {
        CompanyCode = Required(companyCode, nameof(companyCode)).ToUpperInvariant();
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
        DefaultCurrencyCode = NormalizeCurrencyCode(defaultCurrencyCode, nameof(defaultCurrencyCode));
        TimeZoneId = Required(timeZoneId, nameof(timeZoneId));
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public void SetRegistrationCountry(int countryId)
    {
        if (countryId <= 0)
            throw new ArgumentOutOfRangeException(nameof(countryId));

        RegistrationCountryId = countryId;
    }
}
