using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public interface IAuthEmailService
{
    void SendConfirmationEmail(ApplicationUser user, string code);
    void SendResetPasswordEmail(ApplicationUser user, string code);
    void SendInvitationEmail(string email, string firstName, Guid invitationId, string token);
}
