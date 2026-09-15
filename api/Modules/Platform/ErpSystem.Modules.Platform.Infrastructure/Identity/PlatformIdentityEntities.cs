using Microsoft.AspNetCore.Identity;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Domain.Security.Users.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ErpSystem.Modules.Platform.Infrastructure.Identity;

/// <summary>
/// Platform-owned identity and SaaS boundary records.  These records deliberately
/// contain only platform concerns; HR stores user/tenant/company ids as scalar
/// values and never owns a navigation to these types.
/// </summary>
public sealed class PlatformApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsDisabled { get; set; }
    public int LifecycleStatus { get; set; }
    public DateTime? ArchivedOn { get; set; }
    public string? ArchiveReason { get; set; }
    public string? ProfilePicture { get; set; }
    public List<PlatformRefreshToken> RefreshTokens { get; set; } = [];
    public ICollection<PlatformUserTenantAccess> TenantAccesses { get; set; } = [];
    public ICollection<PlatformUserCompanyAccess> CompanyAccesses { get; set; } = [];

    public void Disable() => IsDisabled = true;

    public void Enable() => IsDisabled = false;

    public void Archive(string reason, DateTime archivedOn)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);
        LifecycleStatus = (int)UserLifecycleStatus.Archived;
        ArchivedOn = archivedOn;
        ArchiveReason = reason.Trim();
        IsDisabled = true;
    }

    public void Restore()
    {
        LifecycleStatus = (int)UserLifecycleStatus.Active;
        ArchivedOn = null;
        ArchiveReason = null;
        IsDisabled = false;
    }
}

public sealed class PlatformApplicationRole : IdentityRole
{
    public PlatformApplicationRole() { }

    public PlatformApplicationRole(string roleName) : base(roleName) { }

    public string? TenantId { get; set; }
    public bool IsSystem { get; set; }
    public bool IsDefault { get; set; }
    public bool IsDeleted { get; set; }
}

public sealed class PlatformTenant
{
    private PlatformTenant() { }

    public PlatformTenant(string id, string identifier, string name, DateTime createdOn)
    {
        Id = Required(id, nameof(id), 32);
        Identifier = Required(identifier, nameof(identifier), 100);
        Name = Required(name, nameof(name), 200);
        CreatedOn = createdOn;
        SubscriptionStartedOn = createdOn;
        SubscriptionStatus = (int)TenantSubscriptionStatus.Active;
        LifecycleStatus = (int)PlatformTenantLifecycleStatus.Active;
        IsActive = true;
        MaxAdmins = 5;
        MaxUsers = 100;
    }

    public string Id { get; private set; } = string.Empty;
    public string Identifier { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public int LifecycleStatus { get; private set; }
    public DateTime? ArchivedOn { get; private set; }
    public string? ArchiveReason { get; private set; }
    public DateTime? PurgeScheduledOn { get; private set; }
    public byte[] RowVersion { get; private set; } = [];
    public DateTime CreatedOn { get; private set; }
    public int SubscriptionStatus { get; private set; }
    public DateTime SubscriptionStartedOn { get; private set; }
    public DateTime? SubscriptionEndsOn { get; private set; }
    public string? PlanName { get; private set; }
    public int MaxAdmins { get; private set; }
    public int MaxUsers { get; private set; }
    public string? BillingEmail { get; private set; }
    public string? ContactName { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? UpdatedOn { get; private set; }

    public void Update(
        string identifier,
        string name,
        bool isActive,
        int subscriptionStatus,
        DateTime subscriptionStartedOn,
        DateTime? subscriptionEndsOn,
        string? planName,
        int maxAdmins,
        int maxUsers,
        string? billingEmail,
        string? contactName,
        string? contactPhone,
        string? notes,
        DateTime updatedOn)
    {
        Identifier = Required(identifier, nameof(identifier), 100);
        Name = Required(name, nameof(name), 200);
        IsActive = isActive;
        SubscriptionStatus = subscriptionStatus;
        SubscriptionStartedOn = subscriptionStartedOn;
        SubscriptionEndsOn = subscriptionEndsOn;
        PlanName = Optional(planName, 100);
        MaxAdmins = Positive(maxAdmins, nameof(maxAdmins));
        MaxUsers = Positive(maxUsers, nameof(maxUsers));
        BillingEmail = Optional(billingEmail, 256);
        ContactName = Optional(contactName, 200);
        ContactPhone = Optional(contactPhone, 32);
        Notes = Optional(notes, 2000);
        UpdatedOn = updatedOn;
    }

    public void Archive(string reason, DateTime archivedOn, DateTime? purgeScheduledOn)
    {
        if (LifecycleStatus != (int)PlatformTenantLifecycleStatus.Active)
            return;

        IsActive = false;
        LifecycleStatus = purgeScheduledOn.HasValue
            ? (int)PlatformTenantLifecycleStatus.PurgeScheduled
            : (int)PlatformTenantLifecycleStatus.Archived;
        ArchivedOn = archivedOn;
        ArchiveReason = Required(reason, nameof(reason), 1000);
        PurgeScheduledOn = purgeScheduledOn;
        UpdatedOn = archivedOn;
    }

    public void Restore(DateTime restoredOn)
    {
        LifecycleStatus = (int)PlatformTenantLifecycleStatus.Active;
        IsActive = true;
        ArchivedOn = null;
        ArchiveReason = null;
        PurgeScheduledOn = null;
        UpdatedOn = restoredOn;
    }

    private static int Positive(int value, string name) => value > 0
        ? value
        : throw new ArgumentOutOfRangeException(name);

    private static string Required(string value, string name, int maxLength)
    {
        var result = value?.Trim();
        if (string.IsNullOrWhiteSpace(result))
            throw new ArgumentException("A non-empty value is required.", name);
        if (result.Length > maxLength)
            throw new ArgumentOutOfRangeException(name, $"The value cannot exceed {maxLength} characters.");
        return result;
    }

    private static string? Optional(string? value, int maxLength)
    {
        var result = value?.Trim();
        if (string.IsNullOrWhiteSpace(result))
            return null;
        if (result.Length > maxLength)
            throw new ArgumentOutOfRangeException(nameof(value), $"The value cannot exceed {maxLength} characters.");
        return result;
    }
}

public enum PlatformTenantLifecycleStatus
{
    Active = 0,
    Archived = 1,
    PurgeScheduled = 2
}

public sealed class PlatformCompany
{
    private PlatformCompany() { }

    public PlatformCompany(
        string tenantId,
        string companyCode,
        string nameEn,
        string nameAr,
        string defaultCurrencyCode,
        string timeZoneId,
        DateTime createdOn,
        string? createdById = null)
    {
        TenantId = tenantId.Trim();
        CompanyCode = companyCode.Trim().ToUpperInvariant();
        NameEn = nameEn.Trim();
        NameAr = nameAr.Trim();
        DefaultCurrencyCode = defaultCurrencyCode.Trim().ToUpperInvariant();
        TimeZoneId = timeZoneId.Trim();
        CreatedOn = createdOn;
        CreatedById = createdById;
        IsActive = true;
    }
    public int Id { get; private set; }
    public string TenantId { get; private set; } = string.Empty;
    public string CompanyCode { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string? LegalName { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? TaxNumber { get; set; }
    public int? RegistrationCountryId { get; private set; }
    public int? ParentCompanyId { get; private set; }
    public string DefaultCurrencyCode { get; private set; } = "USD";
    public string TimeZoneId { get; private set; } = "UTC";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Logo { get; set; }
    public string? Background { get; set; }
    public bool IsActive { get; private set; }
    public string? CreatedById { get; set; }
    public string? UpdatedById { get; set; }
    public string? DeletedById { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public DateTime? DeletedOn { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public void SetRegistrationCountry(int countryId)
    {
        if (countryId <= 0)
            throw new ArgumentOutOfRangeException(nameof(countryId));

        RegistrationCountryId = countryId;
    }
}

public sealed class PlatformUserTenantAccess
{
    public string TenantId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public DateTime CreatedOn { get; set; }
    public PlatformApplicationUser User { get; set; } = null!;
    public PlatformTenant Tenant { get; set; } = null!;
}

public sealed class PlatformUserCompanyAccess
{
    public string TenantId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedOn { get; set; }
    public PlatformApplicationUser User { get; set; } = null!;
    public PlatformCompany Company { get; set; } = null!;
}

public sealed class PlatformAuthenticationSelectionChallenge
{
    public string JwtId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string? TenantId { get; set; }
    public DateTime ExpiresOn { get; set; }
    public DateTime CreatedOn { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public PlatformApplicationUser User { get; set; } = null!;
}

public sealed class PlatformUserInvitation
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
    public string RolesJson { get; set; } = "[]";
    public string CompanyIdsJson { get; set; } = "[]";
    public int DefaultCompanyId { get; set; }
    public string InvitedByUserId { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; }
    public DateTime ExpiresOn { get; set; }
    public DateTime? AcceptedOn { get; set; }
    public DateTime? RevokedOn { get; set; }
    public PlatformUserInvitationStatus Status { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public IReadOnlyCollection<string> Roles =>
        JsonSerializer.Deserialize<string[]>(RolesJson) ?? [];

    public IReadOnlyCollection<int> CompanyIds =>
        JsonSerializer.Deserialize<int[]>(CompanyIdsJson) ?? [];

}

public enum PlatformUserInvitationStatus
{
    Pending = 0,
    Accepted = 1,
    Revoked = 2
}

public sealed class PlatformTenantModuleEntitlement
{
    public string TenantId { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
}

public sealed class PlatformTenantSubmoduleEntitlement
{
    public string TenantId { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string SubmoduleCode { get; set; } = string.Empty;
}

[Owned]
public sealed class PlatformRefreshToken
{
    public const string RotationReason = "Rotated";

    public int Id { get; private set; }
    public string TokenHash { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string JwtId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime ExpiresOn { get; set; }
    public DateTime? RevokedOn { get; set; }
    public string? RevocationReason { get; set; }
    public string? CreatedByIp { get; set; }
    public string? CreatedByUserAgent { get; set; }

    public bool IsActiveAt(DateTime utcNow) => RevokedOn is null && utcNow < ExpiresOn;

    public bool WasRotated =>
        RevokedOn.HasValue &&
        string.Equals(RevocationReason, RotationReason, StringComparison.Ordinal);

    public static PlatformRefreshToken Create(
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

        return new PlatformRefreshToken
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

    public bool WasRotatedWithin(TimeSpan gracePeriod, DateTime utcNow) =>
        WasRotated && utcNow - RevokedOn!.Value <= gracePeriod;

    public void Revoke(string reason, DateTime revokedOn)
    {
        if (RevokedOn.HasValue)
            return;
        RevokedOn = revokedOn;
        RevocationReason = reason;
    }
}
