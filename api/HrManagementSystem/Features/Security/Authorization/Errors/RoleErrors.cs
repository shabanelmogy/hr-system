using HrManagementSystem.Features.Security.Authorization.Contracts;

namespace HrManagementSystem.Features.Security.Authorization.Errors
{
    public class RoleErrors(IStringLocalizer<RoleRequest> localizer)
    {
        private readonly IStringLocalizer<RoleRequest> _localizer = localizer;

        public Error RoleNotFound =>
            new("Role.RoleNotFound", _localizer[nameof(RoleNotFound)], StatusCodes.Status404NotFound);

        public Error InvalidPermissions =>
            new("Role.InvalidPermissions", _localizer[nameof(InvalidPermissions)], StatusCodes.Status400BadRequest);

        public Error DuplicatedRole =>
            new("Role.DuplicatedRole", _localizer[nameof(DuplicatedRole)], StatusCodes.Status409Conflict);
    }
}
