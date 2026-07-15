using HrManagementSystem.Shared.Settings;

using HrManagementSystem.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Features.Security.Authentication.Services;

public class AuthEmailService(
    IEmailSender emailSender,
    IOptions<AppSettings> appSettings) : IAuthEmailService
{
    private readonly IEmailSender _emailSender = emailSender;
    private readonly AppSettings _appSettings = appSettings.Value;

    public void SendConfirmationEmail(ApplicationUser user, string code, string? returnUrl = null)
    {
        var url = returnUrl ?? "email-confirmation";
        var actionUrl = $"{_appSettings.FrontendUrl}/{url}?userId={user.Id}&code={code}";
        EnqueueEmail(user.Email!, "HR Management System: Email confirmation",
            "EmailConfirmation", user.FirstName, actionUrl);
    }

    public void SendResetPasswordEmail(ApplicationUser user, string code, string? returnUrl = null)
    {
        var url = returnUrl ?? "reset-password";
        var actionUrl = $"{_appSettings.FrontendUrl}/{url}?email={user.Email}&code={code}";
        EnqueueEmail(user.Email!, "HR Management System: Reset password",
            "ForgetPassword", user.FirstName, actionUrl);
    }

    private void EnqueueEmail(string to, string subject, string template, string name, string actionUrl)
    {
        var body = EmailBodyBuilder.GenerateEmailBody(template, new Dictionary<string, string>
        {
            { "{{name}}", name },
            { "{{action_url}}", actionUrl }
        });

        BackgroundJob.Enqueue(() => _emailSender.SendEmailAsync(to, subject, body));
    }
}
