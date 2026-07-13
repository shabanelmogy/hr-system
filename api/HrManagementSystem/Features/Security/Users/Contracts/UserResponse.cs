namespace HrManagementSystem.Features.Security.Users.Contracts
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
        IEnumerable<string> Roles
    );
}