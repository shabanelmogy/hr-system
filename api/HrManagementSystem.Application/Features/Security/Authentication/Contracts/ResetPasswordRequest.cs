namespace HrManagementSystem.Application.Features.Security.Authentication.Contracts
{
    public record ResetPasswordRequest(
        string Email,
        string Code,
        string NewPassword
    );
}