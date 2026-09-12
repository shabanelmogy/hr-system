using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;

namespace ErpSystem.Modules.Platform.Application.CompanyAccess;

internal sealed class CompanyAccessService(
    ICompanyAccessSource source,
    ITenantMembershipService tenantMemberships) : ICompanyAccessService
{
    public async Task<IReadOnlyList<CompanyAccessOption>> GetAvailableCompaniesAsync(
        string userId,
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        var accesses = await source.GetAsync(userId, tenantId, cancellationToken).ConfigureAwait(false);

        return accesses
            .Where(access => access.IsActive)
            .Select(ToOption)
            .ToArray();
    }

    public async Task<CompanyAccessOption?> GetAvailableCompanyAsync(
        string userId,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken = default)
    {
        if (!await tenantMemberships.HasTenantAccessAsync(userId, tenantId, cancellationToken).ConfigureAwait(false))
            return null;

        var accesses = await source.GetAsync(userId, tenantId, cancellationToken).ConfigureAwait(false);
        var company = accesses.SingleOrDefault(access =>
            access.Id == companyId && access.IsActive);

        return company is null ? null : ToOption(company);
    }

    private static CompanyAccessOption ToOption(CompanyAccessSnapshot access) =>
        new(access.Id, access.CompanyCode, access.NameAr, access.NameEn);
}
