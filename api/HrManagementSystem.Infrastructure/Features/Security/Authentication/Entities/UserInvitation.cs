using System.Text.Json;
using HrManagementSystem.Domain.Common.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

public sealed class UserInvitation : ITenantScoped
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string NormalizedUserName { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public string RolesJson { get; private set; } = "[]";
    public string CompanyIdsJson { get; private set; } = "[]";
    public int DefaultCompanyId { get; set; }
    public string InvitedByUserId { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; }
    public DateTime ExpiresOn { get; set; }
    public DateTime? AcceptedOn { get; set; }
    public DateTime? RevokedOn { get; set; }
    public UserInvitationStatus Status { get; private set; } = UserInvitationStatus.Pending;
    public byte[] RowVersion { get; set; } = [];

    public IReadOnlyCollection<string> Roles =>
        JsonSerializer.Deserialize<string[]>(RolesJson) ?? [];

    public IReadOnlyCollection<int> CompanyIds =>
        JsonSerializer.Deserialize<int[]>(CompanyIdsJson) ?? [];

    public void SetAssignments(IEnumerable<string> roles, IEnumerable<int> companyIds)
    {
        RolesJson = JsonSerializer.Serialize(roles.Distinct(StringComparer.OrdinalIgnoreCase).Order());
        CompanyIdsJson = JsonSerializer.Serialize(companyIds.Distinct().Order());
    }

    public void UpdatePendingDetails(
        string firstName,
        string lastName,
        string userName,
        string normalizedUserName,
        IEnumerable<string> roles,
        IEnumerable<int> companyIds,
        int defaultCompanyId,
        string invitedByUserId)
    {
        if (Status != UserInvitationStatus.Pending)
            throw new InvalidOperationException("Only pending invitations can be updated.");

        FirstName = firstName;
        LastName = lastName;
        UserName = userName;
        NormalizedUserName = normalizedUserName;
        DefaultCompanyId = defaultCompanyId;
        InvitedByUserId = invitedByUserId;
        SetAssignments(roles, companyIds);
    }

    public void Renew(string tokenHash, DateTime expiresOn)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tokenHash);
        TokenHash = tokenHash;
        ExpiresOn = expiresOn;
    }

    public bool IsActiveAt(DateTime now) => Status == UserInvitationStatus.Pending && ExpiresOn > now;

    public void Accept(DateTime acceptedOn)
    {
        if (Status != UserInvitationStatus.Pending)
            throw new InvalidOperationException("Only pending invitations can be accepted.");

        Status = UserInvitationStatus.Accepted;
        AcceptedOn = acceptedOn;
    }

    public void Revoke(DateTime revokedOn)
    {
        if (Status != UserInvitationStatus.Pending)
            return;

        Status = UserInvitationStatus.Revoked;
        RevokedOn = revokedOn;
    }
}

public enum UserInvitationStatus
{
    Pending = 0,
    Accepted = 1,
    Revoked = 2
}
