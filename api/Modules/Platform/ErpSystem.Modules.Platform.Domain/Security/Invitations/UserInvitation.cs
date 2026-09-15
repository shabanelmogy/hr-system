namespace ErpSystem.Modules.Platform.Domain.Security.Invitations;

public sealed class UserInvitation
{
    private readonly List<string> _roles = [];
    private readonly List<int> _companyIds = [];

    private UserInvitation()
    {
    }

    public Guid Id { get; private set; }
    public string TenantId { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string NormalizedEmail { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string UserName { get; private set; } = string.Empty;
    public string NormalizedUserName { get; private set; } = string.Empty;
    public string TokenHash { get; private set; } = string.Empty;
    public IReadOnlyCollection<string> Roles => _roles;
    public IReadOnlyCollection<int> CompanyIds => _companyIds;
    public int DefaultCompanyId { get; private set; }
    public string InvitedByUserId { get; private set; } = string.Empty;
    public DateTime CreatedOn { get; private set; }
    public DateTime ExpiresOn { get; private set; }
    public DateTime? AcceptedOn { get; private set; }
    public DateTime? RevokedOn { get; private set; }
    public UserInvitationStatus Status { get; private set; }

    public static UserInvitation Create(
        Guid id,
        string tenantId,
        string email,
        string normalizedEmail,
        string firstName,
        string lastName,
        string userName,
        string normalizedUserName,
        IEnumerable<string> roles,
        IEnumerable<int> companyIds,
        int defaultCompanyId,
        string invitedByUserId,
        DateTime createdOn)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Invitation id is required.", nameof(id));
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(normalizedEmail);
        ArgumentException.ThrowIfNullOrWhiteSpace(userName);
        ArgumentException.ThrowIfNullOrWhiteSpace(normalizedUserName);
        ArgumentException.ThrowIfNullOrWhiteSpace(invitedByUserId);

        var invitation = new UserInvitation
        {
            Id = id,
            TenantId = tenantId,
            Email = email,
            NormalizedEmail = normalizedEmail,
            FirstName = firstName,
            LastName = lastName,
            UserName = userName,
            NormalizedUserName = normalizedUserName,
            DefaultCompanyId = defaultCompanyId,
            InvitedByUserId = invitedByUserId,
            CreatedOn = createdOn,
            Status = UserInvitationStatus.Pending
        };
        invitation.SetAssignments(roles, companyIds);
        invitation.EnsureDefaultCompanyIsAssigned();
        return invitation;
    }

    public static UserInvitation Rehydrate(
        Guid id,
        string tenantId,
        string email,
        string normalizedEmail,
        string firstName,
        string lastName,
        string userName,
        string normalizedUserName,
        string tokenHash,
        IEnumerable<string> roles,
        IEnumerable<int> companyIds,
        int defaultCompanyId,
        string invitedByUserId,
        DateTime createdOn,
        DateTime expiresOn,
        DateTime? acceptedOn,
        DateTime? revokedOn,
        UserInvitationStatus status)
    {
        var invitation = new UserInvitation
        {
            Id = id,
            TenantId = tenantId,
            Email = email,
            NormalizedEmail = normalizedEmail,
            FirstName = firstName,
            LastName = lastName,
            UserName = userName,
            NormalizedUserName = normalizedUserName,
            TokenHash = tokenHash,
            DefaultCompanyId = defaultCompanyId,
            InvitedByUserId = invitedByUserId,
            CreatedOn = createdOn,
            ExpiresOn = expiresOn,
            AcceptedOn = acceptedOn,
            RevokedOn = revokedOn,
            Status = status
        };
        invitation.SetAssignments(roles, companyIds);
        return invitation;
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
        EnsurePending();
        ArgumentException.ThrowIfNullOrWhiteSpace(userName);
        ArgumentException.ThrowIfNullOrWhiteSpace(normalizedUserName);
        ArgumentException.ThrowIfNullOrWhiteSpace(invitedByUserId);

        FirstName = firstName;
        LastName = lastName;
        UserName = userName;
        NormalizedUserName = normalizedUserName;
        DefaultCompanyId = defaultCompanyId;
        InvitedByUserId = invitedByUserId;
        SetAssignments(roles, companyIds);
        EnsureDefaultCompanyIsAssigned();
    }

    public void Renew(string tokenHash, DateTime expiresOn)
    {
        EnsurePending();
        ArgumentException.ThrowIfNullOrWhiteSpace(tokenHash);
        if (expiresOn <= CreatedOn)
            throw new ArgumentOutOfRangeException(nameof(expiresOn));

        TokenHash = tokenHash;
        ExpiresOn = expiresOn;
    }

    public bool IsActiveAt(DateTime utcNow) =>
        Status == UserInvitationStatus.Pending && ExpiresOn > utcNow;

    public void Accept(DateTime acceptedOn)
    {
        EnsurePending();
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

    private void SetAssignments(IEnumerable<string> roles, IEnumerable<int> companyIds)
    {
        ArgumentNullException.ThrowIfNull(roles);
        ArgumentNullException.ThrowIfNull(companyIds);

        _roles.Clear();
        _roles.AddRange(roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Select(role => role.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(role => role, StringComparer.OrdinalIgnoreCase));

        _companyIds.Clear();
        _companyIds.AddRange(companyIds.Distinct().Order());

        if (_roles.Count == 0)
            throw new InvalidOperationException("At least one role is required.");
        if (_companyIds.Count == 0)
            throw new InvalidOperationException("At least one company is required.");
    }

    private void EnsureDefaultCompanyIsAssigned()
    {
        if (DefaultCompanyId <= 0 || !_companyIds.Contains(DefaultCompanyId))
            throw new InvalidOperationException("The default company must be assigned to the invitation.");
    }

    private void EnsurePending()
    {
        if (Status != UserInvitationStatus.Pending)
            throw new InvalidOperationException("Only pending invitations can be changed.");
    }
}

public enum UserInvitationStatus
{
    Pending = 0,
    Accepted = 1,
    Revoked = 2
}
