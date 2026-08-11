namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public record UserProfileResponse(
        string? id,
        string Email,
        string UserName,
        string FirstName,
        string LastName
    );
}