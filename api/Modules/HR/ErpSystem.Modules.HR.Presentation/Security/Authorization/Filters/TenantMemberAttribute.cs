namespace ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;

/// <summary>
/// Wire-compatible HR alias. New modules should use the shared authorization
/// BuildingBlock and therefore never depend on HR.Presentation.
/// </summary>
public sealed class TenantMemberAttribute : ErpSystem.BuildingBlocks.Authorization.TenantMemberAttribute
{
    public new const string PolicyName = ErpSystem.BuildingBlocks.Authorization.AuthorizationPolicyNames.TenantMember;
}
