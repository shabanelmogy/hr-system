using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace HrManagementSystem.Shared.Services;

public class EmailService(IOptions<MailSettings> mailsettings) : IEmailSender
{
    private readonly MailSettings _mailsettings = mailsettings.Value;

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var message = new MimeMessage
        {
            Sender = MailboxAddress.Parse(_mailsettings.Mail),
            Subject = subject
        };

        message.To.Add(MailboxAddress.Parse(email));

        var builder = new BodyBuilder
        {
            HtmlBody = htmlMessage
        };

        message.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();


        smtp.Connect(_mailsettings.Host, _mailsettings.Port, SecureSocketOptions.SslOnConnect);

        smtp.Authenticate(_mailsettings.Mail, _mailsettings.Password);

        await smtp.SendAsync(message);

        smtp.Disconnect(true);
    }
}
