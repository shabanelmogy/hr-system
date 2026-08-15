using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace HrManagementSystem.Infrastructure.Common.Services;

public class EmailService(IOptions<MailSettings> mailsettings) : IEmailSender
{
    private readonly MailSettings _mailsettings = mailsettings.Value;

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var message = new MimeMessage { Subject = subject };
        message.From.Add(new MailboxAddress(_mailsettings.DisplayName, _mailsettings.Mail));

        message.To.Add(MailboxAddress.Parse(email));

        var builder = new BodyBuilder
        {
            HtmlBody = htmlMessage
        };

        message.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(
            _mailsettings.Host,
            _mailsettings.Port,
            SecureSocketOptions.SslOnConnect);
        await smtp.AuthenticateAsync(_mailsettings.Mail, _mailsettings.Password);
        await smtp.SendAsync(message);
        await smtp.DisconnectAsync(true);
    }
}
