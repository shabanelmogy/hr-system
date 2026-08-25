namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

public sealed class AuthenticationSelectionChallenge
{
    private AuthenticationSelectionChallenge()
    {
    }

    public AuthenticationSelectionChallenge(
        string jwtId,
        string userId,
        string scope,
        DateTime createdOn,
        DateTime expiresOn,
        string? tenantId = null)
    {
        JwtId = jwtId;
        UserId = userId;
        Scope = scope;
        TenantId = tenantId;
        ExpiresOn = expiresOn;
        CreatedOn = createdOn;
    }

    public string JwtId { get; private set; } = string.Empty;
    public string UserId { get; private set; } = string.Empty;
    public string Scope { get; private set; } = string.Empty;
    public string? TenantId { get; private set; }
    public DateTime ExpiresOn { get; private set; }
    public DateTime CreatedOn { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    public ApplicationUser User { get; private set; } = null!;
}
