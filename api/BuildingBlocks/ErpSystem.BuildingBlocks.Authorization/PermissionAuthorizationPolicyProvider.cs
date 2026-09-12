using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace ErpSystem.BuildingBlocks.Authorization;

/// <summary>
/// Falls back to a permission requirement for policy names that are not explicit
/// host policies. The handler remains replaceable and owns the actual access rule.
/// </summary>
public sealed class PermissionAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options)
    : DefaultAuthorizationPolicyProvider(options)
{
    private readonly AuthorizationOptions _authorizationOptions = options.Value;

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        var policy = await base.GetPolicyAsync(policyName).ConfigureAwait(false);
        if (policy is not null)
            return policy;

        var permissionPolicy = new AuthorizationPolicyBuilder()
            .AddRequirements(new PermissionRequirement(policyName))
            .Build();
        _authorizationOptions.AddPolicy(policyName, permissionPolicy);
        return permissionPolicy;
    }
}
