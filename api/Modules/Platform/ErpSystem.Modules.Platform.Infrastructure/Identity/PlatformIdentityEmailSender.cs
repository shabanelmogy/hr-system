using System.ComponentModel.DataAnnotations;
using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using System.Diagnostics;
using ErpSystem.Modules.Platform.Application.Features.MessageLogs;
using ErpSystem.Modules.Platform.Infrastructure.Features.MessageLogs;
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
        string tenantId,
        int companyId,
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
    IOptions<PlatformPublicApplicationSettings> applicationOptions,
    IAccountEmailRenderer renderer,
    IAccountEmailScopeResolver scopeResolver,
    IMessageAttemptRecorder recorder,
    IPlatformSmtpTransport transport,
    TimeProvider clock,
    ICurrentActor actor) : IPlatformIdentityEmailSender
{
    private readonly PlatformMailSettings _mail = mailOptions.Value;
    private readonly PlatformPublicApplicationSettings _application = applicationOptions.Value;

    public Task SendConfirmationAsync(
        PlatformApplicationUser user,
        string code,
        CancellationToken cancellationToken) =>
        SendAsync(
            user.Email!,
            "email-confirmation",
            user.FirstName,
            () => BuildLink("confirm-email", new Dictionary<string, string?>
            {
                ["userId"] = user.Id,
                ["code"] = code
            }),
            null, null, cancellationToken, user.Id);

    public Task SendPasswordResetAsync(
        PlatformApplicationUser user,
        string code,
        CancellationToken cancellationToken) =>
        SendAsync(
            user.Email!,
            "password-reset",
            user.FirstName,
            () => BuildLink("reset-password", new Dictionary<string, string?>
            {
                ["email"] = user.Email,
                ["code"] = code
            }),
            null, null, cancellationToken, user.Id);

    public Task SendInvitationAsync(
        string email,
        string firstName,
        Guid invitationId,
        string token,
        string tenantId,
        int companyId,
        CancellationToken cancellationToken) =>
        SendAsync(
            email,
            "user-invitation",
            firstName,
            () => BuildLink("accept-invitation", new Dictionary<string, string?>
            {
                ["invitationId"] = invitationId.ToString(),
                ["token"] = token
            }),
            tenantId, companyId, cancellationToken);

    private async Task SendAsync(
        string address,
        string templateId,
        string name,
        Func<string> buildActionUrl,
        string? trustedTenantId,
        int? trustedCompanyId,
        CancellationToken cancellationToken,
        string? recipientUserId = null)
    {
        var language = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "ar" ? "ar" : "en";
        var started = clock.GetUtcNow().UtcDateTime;
        var timer = Stopwatch.StartNew();
        var phase = "configuration"; var accepted = false;
        MessageAttemptStart? attempt = null; Guid? attemptId = null;
        var status = "failed"; string? cause = null; int? smtpCode = null;
        try
        {
            var scope = await scopeResolver.ResolveAsync(trustedTenantId, trustedCompanyId, recipientUserId, cancellationToken);
            if (scope is not null)
            {
                attempt = new(scope.TenantId, scope.CompanyId, actor.UserId, actor.CorrelationId,
                    started, templateId, language, address);
                attemptId = await recorder.StartAsync(attempt);
            }
            EnsureMailEnabled();
            var actionUrl = buildActionUrl();
            phase = "render";
            var rendered = await renderer.RenderAsync(templateId, language, name, actionUrl,
                scope?.TenantId, scope?.CompanyId, cancellationToken, recipientUserId);
            if (attemptId is { } snapshotId && attempt is not null)
                await recorder.SnapshotAsync(snapshotId, attempt, MessageSnapshotPolicy.Redact(rendered.Subject, rendered.Html, actionUrl));
            using var message = CreateMessage(address, rendered, _mail);
            await transport.SendAsync(message, _mail, step => { phase = step; accepted |= step == "accepted"; }, cancellationToken);
            status = "accepted";
        }
        catch (Exception error)
        {
            if (accepted) { status = "accepted"; cause = null; }
            else
            {
                var transferring = phase == "send";
                status = error is OperationCanceledException ? (transferring ? "uncertain" : "cancelled")
                    : transferring && error is not SmtpCommandException ? "uncertain" : "failed";
                cause = error switch
                {
                    OperationCanceledException => "cancelled",
                    SmtpCommandException smtp => "rejected",
                    _ when phase == "configuration" => _mail.Enabled ? "configuration" : "disabled",
                    _ when phase == "render" => "content",
                    _ when phase == "authenticate" => "authentication",
                    _ when phase == "connect" => "connection",
                    _ when transferring => "communication",
                    _ => "unknown"
                };
                if (error is SmtpCommandException command) smtpCode = (int)command.StatusCode;
            }
            throw;
        }
        finally
        {
            if (attemptId is { } id && attempt is not null)
                await recorder.CompleteAsync(id, attempt, new(clock.GetUtcNow().UtcDateTime,
                    timer.ElapsedMilliseconds, status, phase, cause, smtpCode));
        }
    }

    public static MimeMessage CreateMessage(string address, RenderedAccountEmail rendered, PlatformMailSettings mail)
    {
        var message = new MimeMessage { Subject = rendered.Subject };
        message.From.Add(new MailboxAddress(mail.DisplayName, mail.Mail));
        message.To.Add(MailboxAddress.Parse(address));
        message.Body = new BodyBuilder { HtmlBody = rendered.Html, TextBody = rendered.Text }.ToMessageBody();
        return message;
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
