namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public record UserResponse(
        string Id,
        string FirstName,
        string LastName,
        string UserName,
        string Email,
        bool IsDisabled,
        bool IsLocked,
        string? ProfilePicture,
        IReadOnlyCollection<string> Roles,
        IReadOnlyCollection<int> CompanyIds,
        int? DefaultCompanyId
    );
}
