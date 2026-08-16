using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Security.Authentication;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

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
        var invitation = new UserInvitation();
        invitation.SetAssignments(["admin", "Admin"], [4, 2, 4]);
        invitation.Renew(new string('A', 64), DateTime.UtcNow.AddDays(1));

        Assert.Equal(["admin"], invitation.Roles);
        Assert.Equal([2, 4], invitation.CompanyIds);
        Assert.DoesNotContain("Token", typeof(UserInvitation).GetProperties().Select(property => property.Name));
        Assert.Equal(64, invitation.TokenHash.Length);
    }

    [Fact]
    public void Invitation_StatusTransitionsAreOneWay()
    {
        var invitation = new UserInvitation();
        invitation.Accept(DateTime.UtcNow);
        invitation.Revoke(DateTime.UtcNow);

        Assert.Equal(UserInvitationStatus.Accepted, invitation.Status);
        Assert.NotNull(invitation.AcceptedOn);
        Assert.Null(invitation.RevokedOn);
    }

    [Fact]
    public void Invitation_CannotBeAcceptedMoreThanOnce()
    {
        var invitation = new UserInvitation();
        invitation.Accept(DateTime.UtcNow);

        Assert.Throws<InvalidOperationException>(() => invitation.Accept(DateTime.UtcNow));
    }

    [Fact]
    public void PendingInvitation_CanUpdateProvisioningDetails()
    {
        var invitation = new UserInvitation();

        invitation.UpdatePendingDetails(
            "Ada", "Lovelace", "ada", "ADA", ["user"], [3], 3, "inviter");

        Assert.Equal("Ada", invitation.FirstName);
        Assert.Equal("ADA", invitation.NormalizedUserName);
        Assert.Equal(["user"], invitation.Roles);
        Assert.Equal([3], invitation.CompanyIds);
    }
}
