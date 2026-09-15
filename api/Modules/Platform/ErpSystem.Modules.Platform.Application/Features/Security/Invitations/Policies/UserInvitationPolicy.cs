using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using ErpSystem.Modules.Platform.Domain.Security.Invitations;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Policies;

public sealed class InvitationSettings
{
    public const string SectionName = "InvitationSettings";

    [Range(1, 720)]
    public int ExpirationHours { get; set; } = 72;
}

public interface IUserInvitationPolicy
{
    DateTime GetExpiration(DateTime utcNow);
    string GetStatus(UserInvitation invitation, DateTime utcNow);
}

internal sealed class UserInvitationPolicy(IOptions<InvitationSettings> settings) : IUserInvitationPolicy
{
    private readonly InvitationSettings _settings = settings.Value;

    public DateTime GetExpiration(DateTime utcNow) => utcNow.AddHours(_settings.ExpirationHours);

    public string GetStatus(UserInvitation invitation, DateTime utcNow) =>
        invitation.Status == UserInvitationStatus.Pending && invitation.ExpiresOn <= utcNow
            ? "expired"
            : invitation.Status.ToString().ToLowerInvariant();
}
