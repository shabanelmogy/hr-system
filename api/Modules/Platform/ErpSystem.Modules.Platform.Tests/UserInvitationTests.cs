using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Policies;
using ErpSystem.Modules.Platform.Domain.Security.Invitations;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class UserInvitationTests
{
    [Fact]
    public void InvitationSettings_DefaultToThreeDays()
    {
        var settings = Options.Create(new InvitationSettings()).Value;

        Assert.Equal("InvitationSettings", InvitationSettings.SectionName);
        Assert.Equal(72, settings.ExpirationHours);
    }

    [Fact]
    public void Invitation_PersistsOnlyAssignmentsAndNeverTheRawToken()
    {
        var createdOn = new DateTime(2026, 9, 14, 10, 0, 0, DateTimeKind.Utc);
        var invitation = Create(createdOn, ["admin", "Admin"], [4, 2, 4], 2);
        invitation.Renew(new string('A', 64), createdOn.AddDays(1));

        Assert.Equal(["admin"], invitation.Roles);
        Assert.Equal([2, 4], invitation.CompanyIds);
        Assert.DoesNotContain("Token", typeof(UserInvitation).GetProperties().Select(property => property.Name));
        Assert.Equal(64, invitation.TokenHash.Length);
    }

    [Fact]
    public void Invitation_StatusTransitionsAreOneWay()
    {
        var now = new DateTime(2026, 9, 14, 10, 0, 0, DateTimeKind.Utc);
        var invitation = Create(now);
        invitation.Accept(now.AddMinutes(1));
        invitation.Revoke(now.AddMinutes(2));

        Assert.Equal(UserInvitationStatus.Accepted, invitation.Status);
        Assert.NotNull(invitation.AcceptedOn);
        Assert.Null(invitation.RevokedOn);
    }

    [Fact]
    public void Invitation_CannotBeAcceptedMoreThanOnce()
    {
        var now = new DateTime(2026, 9, 14, 10, 0, 0, DateTimeKind.Utc);
        var invitation = Create(now);
        invitation.Accept(now.AddMinutes(1));

        Assert.Throws<InvalidOperationException>(() => invitation.Accept(now.AddMinutes(2)));
    }

    [Fact]
    public void PendingInvitation_CanUpdateProvisioningDetails()
    {
        var invitation = Create(new DateTime(2026, 9, 14, 10, 0, 0, DateTimeKind.Utc));

        invitation.UpdatePendingDetails(
            "Ada", "Lovelace", "ada", "ADA", ["user"], [3], 3, "inviter");

        Assert.Equal("Ada", invitation.FirstName);
        Assert.Equal("ADA", invitation.NormalizedUserName);
        Assert.Equal(["user"], invitation.Roles);
        Assert.Equal([3], invitation.CompanyIds);
    }

    private static UserInvitation Create(
        DateTime createdOn,
        IEnumerable<string>? roles = null,
        IEnumerable<int>? companyIds = null,
        int defaultCompanyId = 3) =>
        UserInvitation.Create(
            Guid.Parse("2216d342-9d7e-4a31-853d-d395bf11a0d9"),
            "tenant-a",
            "ada@example.com",
            "ADA@EXAMPLE.COM",
            "Ada",
            "Lovelace",
            "ada",
            "ADA",
            roles ?? ["user"],
            companyIds ?? [3],
            defaultCompanyId,
            "inviter",
            createdOn);
}

