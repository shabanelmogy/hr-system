namespace ErpSystem.Modules.Inventory.Infrastructure.Features.Catalog;

internal static class CatalogScope
{
    public static (string TenantId, int CompanyId) Require(ICurrentActor actor)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is null or <= 0)
            throw new InvalidOperationException("A tenant and company are required for company-scoped catalog access.");
        return (actor.TenantId, actor.CompanyId.Value);
    }
}
