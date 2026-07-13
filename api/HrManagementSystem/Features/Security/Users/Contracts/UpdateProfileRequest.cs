namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public record UpdateProfileRequest(
        string? Id,
        string UserName,
        string FirstName,
        string LastName
    );
}