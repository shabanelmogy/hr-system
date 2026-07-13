using HrManagementSystem.Features.Security.Authorization.Contracts;

namespace HrManagementSystem.Features.Security.Authorization.Services
{
    public class RoleService(
        RoleManager<ApplicationRole> roleManager,
        IStringLocalizer<RoleRequest> localizer,
        RoleErrors roleErrors) : IRoleService
    {
        private readonly RoleManager<ApplicationRole> _roleManager = roleManager;
        private readonly IStringLocalizer<RoleRequest> _localizer = localizer;
        private readonly RoleErrors _roleErrors = roleErrors;

        public async Task<List<RoleResponse>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var rolesQuery = _roleManager.Roles;

            var roles = await rolesQuery
                .ProjectToType<RoleResponse>()
                .ToListAsync(cancellationToken);
            return roles;
        }

        public async Task<Result<RoleDetailResponse>> GetAsync(string id)
        {
            if (await _roleManager.FindByIdAsync(id) is not { } role)
                return Result.Failure<RoleDetailResponse>(_roleErrors.RoleNotFound);

            var permissions = await _roleManager.GetClaimsAsync(role);

            var response = new RoleDetailResponse(role.Id, role.Name!, role.IsDeleted, permissions.Select(x => x.Value));

            return Result.Success(response);
        }

        public async Task<Result<RoleResponse>> AddAsync(RoleRequest request, CancellationToken cancellationToken = default)
        {
            var role = new ApplicationRole
            {
                Name = request.Name,
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };

            var result = await _roleManager.CreateAsync(role);

            if (result.Succeeded)
            {
                var response = new RoleResponse(role.Id, role.Name, role.IsDeleted, null);
                return Result.Success(response);
            }

            var error = result.Errors.First();

            return Result.Failure<RoleResponse>(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
        }

        public async Task<Result> UpdateAsync(RoleRequest roleRequest, CancellationToken cancellationToken)
        {
            var currentRole = await _roleManager.FindByIdAsync(roleRequest.Id);
            if (currentRole is null)
                return Result.Failure(_roleErrors.RoleNotFound);

            currentRole.Name = roleRequest.Name;

            var result = await _roleManager.UpdateAsync(currentRole);
            if (result.Succeeded)
            {
                return Result.Success();
            }

            var error = result.Errors.First();

            return Result.Failure<RoleResponse>(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
        }

        public async Task<Result> ToggleStatusAsync(string id, CancellationToken cancellationToken)
        {
            if (await _roleManager.FindByIdAsync(id) is not { } role)
                return Result.Failure<RoleDetailResponse>(_roleErrors.RoleNotFound);

            role.IsDeleted = !role.IsDeleted;

            await _roleManager.UpdateAsync(role);

            return Result.Success();
        }

        public async Task<Result<RoleResponse>> GetRoleClaims(string roleId, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(roleId);

            if (role == null)
                return Result.Failure<RoleResponse>(_roleErrors.RoleNotFound);

            var roleClaims = _roleManager.GetClaimsAsync(role).Result.Select(c => c.Value).ToList();
            var allClaims = Permissions.GetAllPermissions();
            var currentClaims = allClaims.Select(p => new CheckBoxViewModel { DisplayValue = p }).ToList();

            foreach (var claim in currentClaims)
            {
                if (roleClaims.Any(c => c == claim.DisplayValue))
                    claim.IsSelected = true;
            }

            var response = new RoleResponse(roleId, role.Name, role.IsDeleted, currentClaims);

            return Result.Success(response);
        }

        public async Task<Result> UpdateRoleClaims(RoleRequest rolerequest, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(rolerequest.Id);

            if (role == null)
                return Result.Failure(_roleErrors.RoleNotFound);

            var roleClaims = await _roleManager.GetClaimsAsync(role);

            foreach (var claim in roleClaims)
                await _roleManager.RemoveClaimAsync(role, claim);

            var selectedClaims = rolerequest.RoleClaims.Where(c => c.IsSelected).ToList();

            foreach (var claim in selectedClaims)
                await _roleManager.AddClaimAsync(role, new Claim(Permissions.Type, claim.DisplayValue));

            return Result.Success();
        }
    }
}
