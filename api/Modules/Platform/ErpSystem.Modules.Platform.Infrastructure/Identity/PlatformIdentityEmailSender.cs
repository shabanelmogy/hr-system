using System.ComponentModel.DataAnnotations;
using System.Net;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using MimeKit;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

public interface IPlatformIdentityEmailSender
{
    Task SendConfirmationAsync(
        PlatformApplicationUser user,
        string code,
        CancellationToken cancellationToken);

    Task SendPasswordResetAsync(
        PlatformApplicationUser user,
        string code,
        CancellationToken cancellationToken);

    Task SendInvitationAsync(
        string email,
        string firstName,
        Guid invitationId,
        string token,
        CancellationToken cancellationToken);
}

public sealed class PlatformMailSettings : IValidatableObject
{
    public const string SectionName = "MailSettings";

    public bool Enabled { get; set; }

    public string Mail { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Host { get; set; } = string.Empty;

    public int Port { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!Enabled)
            yield break;

        if (string.IsNullOrWhiteSpace(Mail))
        {
            yield return Required(nameof(Mail), "An SMTP sender email is required when mail delivery is enabled.");
        }
        else if (!new EmailAddressAttribute().IsValid(Mail.Trim()))
        {
            yield return Invalid(nameof(Mail), "Mail must be a valid email address.");
        }

        if (string.IsNullOrWhiteSpace(DisplayName))
            yield return Required(nameof(DisplayName), "A non-empty SMTP display name is required when mail delivery is enabled.");

        if (string.IsNullOrWhiteSpace(Password))
            yield return Required(nameof(Password), "An SMTP password is required when mail delivery is enabled.");

        if (string.IsNullOrWhiteSpace(Host))
        {
            yield return Required(nameof(Host), "An SMTP host is required when mail delivery is enabled.");
        }
        else if (Host.Any(char.IsWhiteSpace) || Uri.CheckHostName(Host.Trim()) == UriHostNameType.Unknown)
        {
            yield return Invalid(nameof(Host), "Host must be a valid SMTP host name or IP address.");
        }

        if (Port is < 1 or > 65535)
            yield return Invalid(nameof(Port), "Port must be between 1 and 65535 when mail delivery is enabled.");
    }

    private static ValidationResult Required(string memberName, string message) =>
        new(message, [memberName]);

    private static ValidationResult Invalid(string memberName, string message) =>
        new(message, [memberName]);
}

public sealed class PlatformPublicApplicationSettings : IValidatableObject
{
    public const string SectionName = "AppSettings";

    public string FrontendUrl { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(FrontendUrl))
            yield break;

        if (!Uri.TryCreate(FrontendUrl.Trim(), UriKind.Absolute, out _))
        {
            yield return new ValidationResult(
                "FrontendUrl must be a valid absolute URL.",
                [nameof(FrontendUrl)]);
        }
    }
}

public sealed class PlatformIdentityEmailSender(
    IOptions<PlatformMailSettings> mailOptions,
    IOptions<PlatformPublicApplicationSettings> applicationOptions) : IPlatformIdentityEmailSender
{
    private readonly PlatformMailSettings _mail = mailOptions.Value;
    private readonly PlatformPublicApplicationSettings _application = applicationOptions.Value;

    public Task SendConfirmationAsync(
        PlatformApplicationUser user,
        string code,
        CancellationToken cancellationToken) =>
        SendAsync(
            user.Email!,
            "ERP System: Email confirmation",
            "Confirm your email",
            user.FirstName,
            BuildLink("confirm-email", new Dictionary<string, string?>
            {
                ["userId"] = user.Id,
                ["code"] = code
            }),
            cancellationToken);

    public Task SendPasswordResetAsync(
        PlatformApplicationUser user,
        string code,
        CancellationToken cancellationToken) =>
        SendAsync(
            user.Email!,
            "ERP System: Reset password",
            "Reset your password",
            user.FirstName,
            BuildLink("reset-password", new Dictionary<string, string?>
            {
                ["email"] = user.Email,
                ["code"] = code
            }),
            cancellationToken);

    public Task SendInvitationAsync(
        string email,
        string firstName,
        Guid invitationId,
        string token,
        CancellationToken cancellationToken) =>
        SendAsync(
            email,
            "ERP System: User invitation",
            "Accept your invitation",
            firstName,
            BuildLink("accept-invitation", new Dictionary<string, string?>
            {
                ["invitationId"] = invitationId.ToString(),
                ["token"] = token
            }),
            cancellationToken);

    private async Task SendAsync(
        string address,
        string subject,
        string heading,
        string name,
        string actionUrl,
        CancellationToken cancellationToken)
    {
        EnsureMailEnabled();

        var encodedName = WebUtility.HtmlEncode(name);
        var encodedHeading = WebUtility.HtmlEncode(heading);
        var encodedUrl = WebUtility.HtmlEncode(actionUrl);
        var message = new MimeMessage { Subject = subject };
        message.From.Add(new MailboxAddress(_mail.DisplayName, _mail.Mail));
        message.To.Add(MailboxAddress.Parse(address));
        message.Body = new BodyBuilder
        {
            HtmlBody = $"<h1>{encodedHeading}</h1><p>Hello {encodedName},</p><p><a href=\"{encodedUrl}\">Continue</a></p>"
        }.ToMessageBody();

        using var smtp = new SmtpClient();
        var socketOptions = _mail.Port == 465
            ? SecureSocketOptions.SslOnConnect
            : SecureSocketOptions.StartTls;
        await smtp.ConnectAsync(_mail.Host, _mail.Port, socketOptions, cancellationToken);
        await smtp.AuthenticateAsync(_mail.Mail, _mail.Password, cancellationToken);
        await smtp.SendAsync(message, cancellationToken);
        await smtp.DisconnectAsync(true, cancellationToken);
    }

    private string BuildLink(string path, IReadOnlyDictionary<string, string?> query) =>
        BuildLinkCore(path, query);

    private string BuildLinkCore(string path, IReadOnlyDictionary<string, string?> query)
    {
        EnsureMailEnabled();
        var frontend = new Uri(
            _application.FrontendUrl.TrimEnd('/') + "/",
            UriKind.Absolute);
        var action = new Uri(frontend, path);
        return QueryHelpers.AddQueryString(
            action.ToString(),
            query);
    }

    private void EnsureMailEnabled()
    {
        if (!_mail.Enabled)
        {
            throw new InvalidOperationException(
                "Platform mail delivery is disabled. Set MailSettings:Enabled=true and configure the SMTP Mail, DisplayName, Password, Host, and Port settings before sending email.");
        }
    }
}
