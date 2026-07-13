namespace HrManagementSystem.Features.Security.Authorization.Contracts
{
    public record RoleDetailResponse(
        string Id,
        string Name,
        bool IsDeleted,
        IEnumerable<string> Permissions
    );
}