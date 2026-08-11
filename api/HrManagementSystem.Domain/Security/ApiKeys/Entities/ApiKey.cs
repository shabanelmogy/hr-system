using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Domain.Common.Exceptions;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Security.ApiKeys.Entities;

public sealed class ApiKey : ICompanyScoped
{
    private ApiKey()
    {
    }

    private ApiKey(
        string keyHash,
        string keyPrefix,
        string clientUri,
        string description,
        DateTime createdAt,
        DateTime? expiresAt)
    {
        KeyHash = Required(keyHash, nameof(keyHash));
        KeyPrefix = Required(keyPrefix, nameof(keyPrefix));
        CreatedAt = createdAt;
        IsActive = true;
        UpdateDetails(clientUri, description, expiresAt, createdAt);
    }

    public string TenantId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public int Id { get; private set; }
    public string KeyHash { get; private set; } = string.Empty;
    public string KeyPrefix { get; private set; } = string.Empty;
    public string ClientUri { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? RevocationReason { get; private set; }

    public static ApiKey Create(
        string keyHash,
        string keyPrefix,
        string clientUri,
        string description,
        DateTime createdAt,
        DateTime? expiresAt = null) =>
        new(keyHash, keyPrefix, clientUri, description, createdAt, expiresAt);

    public void UpdateDetails(
        string clientUri,
        string description,
        DateTime? expiresAt,
        DateTime utcNow)
    {
        if (!IsActive)
        {
            throw new DomainRuleException(
                "ApiKey.Revoked",
                "A revoked API key cannot be updated.");
        }

        if (expiresAt.HasValue && expiresAt.Value <= utcNow)
        {
            throw new DomainRuleException(
                "ApiKey.InvalidExpiry",
                "The API key expiry must be in the future.");
        }

        ClientUri = NormalizeClientUri(clientUri);
        Description = Required(description, nameof(description));
        ExpiresAt = expiresAt;
    }

    public void Revoke(string reason, DateTime revokedAt)
    {
        if (!IsActive)
            return;

        IsActive = false;
        RevokedAt = revokedAt;
        RevocationReason = Required(reason, nameof(reason));
    }

    public bool IsUsableAt(DateTime utcNow) =>
        IsActive && RevokedAt is null && (!ExpiresAt.HasValue || ExpiresAt.Value > utcNow);

    private static string NormalizeClientUri(string value)
    {
        var normalized = Required(value, nameof(value));
        if (!Uri.TryCreate(normalized, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new ArgumentException("A valid HTTP or HTTPS client URI is required.", nameof(value));
        }

        return uri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
    }
}
