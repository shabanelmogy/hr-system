namespace HrManagementSystem.Application.Features.Security.Authorization.Contracts
{
    public record RoleRequest(
        string? Id,
        string Name,
        List<CheckBoxViewModel>? RoleClaims
    );
}
