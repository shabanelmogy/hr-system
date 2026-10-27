using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

public interface IPlatformSmtpTransport
{
    Task SendAsync(MimeMessage message, PlatformMailSettings settings, Action<string> stage, CancellationToken token);
}

public sealed class PlatformSmtpTransport : IPlatformSmtpTransport
{
    public async Task SendAsync(MimeMessage message, PlatformMailSettings settings, Action<string> stage, CancellationToken token)
    {
        using var smtp = new SmtpClient();
        stage("connect");
        await smtp.ConnectAsync(settings.Host, settings.Port,
            settings.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls, token);
        stage("authenticate"); await smtp.AuthenticateAsync(settings.Mail, settings.Password, token);
        stage("send"); await smtp.SendAsync(message, token);
        stage("accepted");
        // A failure to QUIT does not undo the server's acceptance.
        stage("disconnect"); await smtp.DisconnectAsync(true, token);
    }
}
