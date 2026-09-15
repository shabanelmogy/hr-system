namespace ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog;

internal static class CompanyScopedCatalogCacheKey
{
    public static string Create(string prefix, ICurrentActor currentActor)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(prefix);
        ArgumentNullException.ThrowIfNull(currentActor);

        var tenantId = currentActor.TenantId;
        var companyId = currentActor.CompanyId;

        if (string.IsNullOrWhiteSpace(tenantId) || companyId is null or <= 0)
        {
            throw new InvalidOperationException(
                "A tenant and company are required for company-scoped cache access.");
        }

        return $"{prefix}:tenant:{tenantId.Length}:{tenantId}:company:{companyId.Value}";
    }
}
