namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class InvitationSettings
{
    public const string SectionName = "InvitationSettings";

    [Range(1, 720)]
    public int ExpirationHours { get; set; } = 72;
}
