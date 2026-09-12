namespace ErpSystem.Modules.Platform.Contracts.Tenancy;

/// <summary>
/// Marks an endpoint as safe while an expired tenant is in read-only mode.
/// Kept in Contracts so business-module presentation layers can attach metadata
/// without referencing Platform Presentation.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class AllowTenantReadOnlyAttribute : Attribute
{
}
