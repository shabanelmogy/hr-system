using System.Net;
using System.Net.Mail;

namespace HrManagementSystem.Shared.Services
{
    public class EmailServiceBase : IEmailSender
    {
        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var emailSender = "shaban.cec@gmail.com";
            var password = "gpafywnhzqvdzdxb";
            var mailMessage = new MailMessage();
            mailMessage.From = new MailAddress(emailSender);
            mailMessage.To.Add(email);
            mailMessage.Subject = subject;
            mailMessage.Body = $"<html><body>{htmlMessage}</body></html>";
            mailMessage.IsBodyHtml = true;

            using SmtpClient _smtpClient = new("smtp.gmail.com");

            _smtpClient.EnableSsl = true;
            _smtpClient.UseDefaultCredentials = false;
            _smtpClient.Credentials = new NetworkCredential(emailSender, password);
            _smtpClient.Port = 465;
            _smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
            _smtpClient.Send(mailMessage);
        }
    }
}