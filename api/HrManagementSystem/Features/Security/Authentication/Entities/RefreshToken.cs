namespace HrManagementSystem.Features.Security.Authentication.Entities;

[Owned]
public class RefreshToken
{
    public string TokenHash { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string JwtId { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresOn { get; set; }
    public DateTime? RevokedOn { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    public string? RevocationReason { get; set; }
    public string? CreatedByIp { get; set; }
    public string? CreatedByUserAgent { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresOn;
    public bool IsActive => RevokedOn is null && !IsExpired;

    public void Revoke(string reason, string? replacedByTokenHash = null)
    {
        if (RevokedOn is not null)
            return;

        RevokedOn = DateTime.UtcNow;
        RevocationReason = reason;
        ReplacedByTokenHash = replacedByTokenHash;
    }
}
