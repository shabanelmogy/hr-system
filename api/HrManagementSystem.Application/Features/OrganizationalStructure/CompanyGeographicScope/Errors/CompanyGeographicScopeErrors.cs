using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Errors;

public sealed class CompanyGeographicScopeErrors(
    IStringLocalizer<UpdateCompanyGeographicScopeRequest> localizer)
{
    public Error CompanyContextRequired => new(
        "CompanyGeographicScope.CompanyContextRequired",
        localizer[nameof(CompanyContextRequired)],
        ErrorType.Forbidden);

    public Error CountriesUnavailable => new(
        "CompanyGeographicScope.CountriesUnavailable",
        localizer[nameof(CountriesUnavailable)],
        ErrorType.Conflict);

    public Error CountriesInUseByAddresses => new(
        "CompanyGeographicScope.CountriesInUseByAddresses",
        localizer[nameof(CountriesInUseByAddresses)],
        ErrorType.Conflict);
}
