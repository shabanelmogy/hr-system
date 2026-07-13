namespace HrManagementSystem.Features.Security.Authorization.Contracts
{
    public record RoleResponse
    (
        string Id,
        string Name,
        bool IsDeleted,
        List<CheckBoxViewModel>? RoleClaims
    );


}
