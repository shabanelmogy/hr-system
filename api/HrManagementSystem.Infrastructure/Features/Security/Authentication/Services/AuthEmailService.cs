using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public class AuthEmailService(
    IBackgroundJobClient backgroundJobs,
    AuthEmailLinkBuilder links) : IAuthEmailService
{
    public void SendConfirmationEmail(ApplicationUser user, string code)
    {
        var actionUrl = links.BuildConfirmationLink(user.Id, code);
        EnqueueEmail(user.Email!, "HR Management System: Email confirmation",
            "EmailConfirmation", user.FirstName, actionUrl);
    }

    public void SendResetPasswordEmail(ApplicationUser user, string code)
    {
        var actionUrl = links.BuildResetPasswordLink(user.Email!, code);
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

        backgroundJobs.Enqueue<IEmailSender>(
            emailSender => emailSender.SendEmailAsync(to, subject, body));
    }
}
