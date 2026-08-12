namespace HrManagementSystem.Api.Common.Tenancy;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class AllowTenantReadOnlyAttribute : Attribute
{
}
