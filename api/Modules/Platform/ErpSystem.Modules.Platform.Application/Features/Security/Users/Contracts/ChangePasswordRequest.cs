namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
{
    public record ChangePasswordRequest(
        string CurrentPassword,
        string NewPassword
    );
}