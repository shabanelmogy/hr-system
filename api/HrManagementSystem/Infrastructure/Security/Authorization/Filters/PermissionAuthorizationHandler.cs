namespace HrManagementSystem.Infrastructure.Security.Authorization.Filters
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {

        public PermissionAuthorizationHandler()
        { }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            var user = context.User.Identity;

            if (user is null || !user.IsAuthenticated)
                return;

            var hasPermission = context.User.Claims.Any(x => x.Value == requirement.Permission && x.Type == Permissions.Type);

            if (!hasPermission)
                return;

            context.Succeed(requirement);
            await Task.CompletedTask;
            return;
        }
    }
}