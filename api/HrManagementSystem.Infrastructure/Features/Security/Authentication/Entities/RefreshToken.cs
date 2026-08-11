namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

[Owned]
public sealed class RefreshToken
{
    public const string RotationReason = "Rotated";

    private RefreshToken()
    {
    }

    public string TokenHash { get; private set; } = string.Empty;
    public string SessionId { get; private set; } = string.Empty;
    public string JwtId { get; private set; } = string.Empty;
    public int CompanyId { get; private set; }
    public DateTime CreatedOn { get; private set; }
    public DateTime ExpiresOn { get; private set; }
    public DateTime? RevokedOn { get; private set; }
    public string? RevocationReason { get; private set; }
    public string? CreatedByIp { get; private set; }
    public string? CreatedByUserAgent { get; private set; }

    public bool WasRotated =>
        RevokedOn.HasValue &&
        string.Equals(RevocationReason, RotationReason, StringComparison.Ordinal);

    public static RefreshToken Create(
        string tokenHash,
        string sessionId,
        string jwtId,
        int companyId,
        DateTime createdOn,
        DateTime expiresOn,
        string? createdByIp,
        string? createdByUserAgent)
    {
        if (expiresOn <= createdOn)
            throw new ArgumentException("Refresh token expiry must be after creation.", nameof(expiresOn));

        return new RefreshToken
        {
            TokenHash = tokenHash,
            SessionId = sessionId,
            JwtId = jwtId,
            CompanyId = companyId,
            CreatedOn = createdOn,
            ExpiresOn = expiresOn,
            CreatedByIp = createdByIp,
            CreatedByUserAgent = createdByUserAgent
        };
    }

    public bool IsActiveAt(DateTime utcNow) => RevokedOn is null && utcNow < ExpiresOn;

    public bool WasRotatedWithin(TimeSpan gracePeriod, DateTime utcNow) =>
        WasRotated && utcNow - RevokedOn!.Value <= gracePeriod;

    public void Revoke(string reason, DateTime revokedOn)
    {
        if (RevokedOn is not null)
            return;

        RevokedOn = revokedOn;
        RevocationReason = reason;
    }
}
