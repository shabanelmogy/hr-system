using Microsoft.AspNetCore.Authorization;

namespace ErpSystem.BuildingBlocks.Authorization;

/// <summary>Stable host-wide authorization policy names.</summary>
public static class AuthorizationPolicyNames
{
    public const string TenantMember = "TenantMember";
}

/// <summary>
/// Declares a named permission policy without coupling a presentation module to
/// another business module's authorization implementation.
/// </summary>
public class HasPermissionAttribute(string permission) : AuthorizeAttribute(permission);

/// <summary>Requires a selected tenant membership under the shared tenant policy.</summary>
public class TenantMemberAttribute : AuthorizeAttribute
{
    public const string PolicyName = AuthorizationPolicyNames.TenantMember;

    public TenantMemberAttribute() : base(PolicyName)
    {
    }
}

/// <summary>Requirement generated for dynamically named permission policies.</summary>
public sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}
