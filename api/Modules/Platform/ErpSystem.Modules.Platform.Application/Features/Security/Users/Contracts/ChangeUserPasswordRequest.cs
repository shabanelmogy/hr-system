namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
{
    public record ChangeUserPasswordRequest(
        string NewPassword,
        string ConfirmPassword
    );
}
