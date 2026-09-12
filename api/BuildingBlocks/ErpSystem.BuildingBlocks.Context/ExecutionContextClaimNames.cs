namespace ErpSystem.BuildingBlocks.Context;

/// <summary>
/// Stable claim names required to resolve the cross-module execution scope.
/// Authentication-specific claims remain owned by the authentication module.
/// </summary>
public static class ExecutionContextClaimNames
{
    public const string TenantId = "tenant_id";

    public const string CompanyId = "company_id";
}
