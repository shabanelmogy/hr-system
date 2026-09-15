namespace ErpSystem.Modules.Platform.Application.Tenancy.Administration;

internal sealed class TenantAdministrationPolicy : ITenantAdministrationPolicy
{
    public string NormalizeIdentifier(string identifier) => identifier.Trim();

    public IReadOnlyList<string> NormalizeTenantIds(IEnumerable<string> tenantIds) =>
        tenantIds.Distinct(StringComparer.Ordinal).ToArray();

    public bool CanSetSeatLimits(
        int maxAdmins,
        int maxUsers,
        int currentAdminCount,
        int currentUserCount) =>
        maxAdmins >= currentAdminCount && maxUsers >= currentUserCount;

    public bool HasAdministratorSeat(int maxAdmins, int currentAdminCount) =>
        currentAdminCount < maxAdmins;
}
