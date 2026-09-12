namespace ErpSystem.Modules.Platform.Contracts.CompanyAccess;

/// <summary>
/// Raw company-access state supplied by the bounded context that currently owns
/// company and user-company persistence. Availability policy is intentionally
/// evaluated by Platform application code.
/// </summary>
public sealed record CompanyAccessSnapshot(
    int Id,
    string CompanyCode,
    string NameAr,
    string NameEn,
    bool IsDefault,
    bool IsActive);

/// <summary>
/// Stable Platform-owned company option used by session/application consumers.
/// </summary>
public sealed record CompanyAccessOption(
    int Id,
    string CompanyCode,
    string NameAr,
    string NameEn);

/// <summary>
/// Compatibility source for company-access persistence. HR currently supplies
/// this source while users, tenants, companies and access rows remain physically
/// HR-owned.
/// </summary>
public interface ICompanyAccessSource
{
    Task<IReadOnlyList<CompanyAccessSnapshot>> GetAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Platform-owned application port for resolving the companies available to a
/// user inside a tenant.
/// </summary>
public interface ICompanyAccessService
{
    Task<IReadOnlyList<CompanyAccessOption>> GetAvailableCompaniesAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default);

    Task<CompanyAccessOption?> GetAvailableCompanyAsync(
        string userId,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken = default);
}
