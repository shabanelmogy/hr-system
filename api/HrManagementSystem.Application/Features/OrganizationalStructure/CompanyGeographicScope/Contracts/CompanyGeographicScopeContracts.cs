namespace HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;

public sealed record CompanyCountryOptionResponse(
    int Id,
    string NameAr,
    string NameEn,
    string? Alpha2Code,
    string? Alpha3Code,
    bool IsSelected,
    bool IsDefault);

public sealed record CompanyGeographicScopeResponse(
    int CompanyId,
    int? DefaultCountryId,
    IReadOnlyList<CompanyCountryOptionResponse> Countries);

public sealed record UpdateCompanyGeographicScopeRequest(
    IReadOnlyList<int> CountryIds,
    int DefaultCountryId);
