namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public record ChangeUserPasswordRequest(
        string NewPassword,
        string ConfirmPassword
    );
}
