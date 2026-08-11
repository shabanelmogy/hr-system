using HrManagementSystem.Application.Features.Security.Authorization.Contracts;

namespace HrManagementSystem.Application.Features.Security.Authorization.Errors
{
    public class RoleErrors(IStringLocalizer<RoleRequest> localizer)
    {
        private readonly IStringLocalizer<RoleRequest> _localizer = localizer;

        public Error RoleNotFound =>
            new("Role.RoleNotFound", _localizer[nameof(RoleNotFound)], ErrorType.NotFound);

        public Error InvalidPermissions =>
            new("Role.InvalidPermissions", _localizer[nameof(InvalidPermissions)], ErrorType.Validation);

        public Error DuplicatedRole =>
            new("Role.DuplicatedRole", _localizer[nameof(DuplicatedRole)], ErrorType.Conflict);
    }
}
