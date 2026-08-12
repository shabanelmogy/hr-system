namespace HrManagementSystem.Infrastructure.Security.Authorization.Filters;

public sealed class TenantMemberAttribute : AuthorizeAttribute
{
    public const string PolicyName = "TenantMember";

    public TenantMemberAttribute() : base(PolicyName)
    {
    }
}
