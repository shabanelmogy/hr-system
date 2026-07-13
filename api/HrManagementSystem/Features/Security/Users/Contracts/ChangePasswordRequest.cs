namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public record ChangePasswordRequest(
        string CurrentPassword,
        string NewPassword
    );
}