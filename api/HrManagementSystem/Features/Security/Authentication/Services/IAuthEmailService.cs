namespace HrManagementSystem.Features.Security.Authentication.Services;

public interface IAuthEmailService
{
    void SendConfirmationEmail(ApplicationUser user, string code, string? returnUrl = null);
    void SendResetPasswordEmail(ApplicationUser user, string code, string? returnUrl = null);
}
