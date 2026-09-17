using ErpSystem.Modules.Platform.Application.Entitlements;

namespace ErpSystem.Modules.Platform.Application.Tenancy.Administration;

public enum TenantAdministrationErrorType
{
    None = 0,
    Validation,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    Unexpected,
    ServiceUnavailable
}

public sealed record TenantAdministrationError(
    string Code,
    string Description,
    TenantAdministrationErrorType Type)
{
    public static readonly TenantAdministrationError None =
        new(string.Empty, string.Empty, TenantAdministrationErrorType.None);
}

public class TenantAdministrationResult
{
    protected TenantAdministrationResult(bool isSuccess, TenantAdministrationError error)
    {
        if (isSuccess && error != TenantAdministrationError.None ||
            !isSuccess && error == TenantAdministrationError.None)
        {
            throw new InvalidOperationException("Tenant administration result and error state are inconsistent.");
        }

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public TenantAdministrationError Error { get; }

    public static TenantAdministrationResult Success() =>
        new(true, TenantAdministrationError.None);

    public static TenantAdministrationResult Failure(TenantAdministrationError error) =>
        new(false, error);

    public static TenantAdministrationResult<T> Success<T>(T value) =>
        new(value, true, TenantAdministrationError.None);

    public static TenantAdministrationResult<T> Failure<T>(TenantAdministrationError error) =>
        new(default, false, error);
}

public sealed class TenantAdministrationResult<T>(
    T? value,
    bool isSuccess,
    TenantAdministrationError error) : TenantAdministrationResult(isSuccess, error)
{
    public T Value => IsSuccess
        ? value!
        : throw new InvalidOperationException("Failure results cannot have a value.");
}

public sealed record TenantAdministrationPageRequest(
    int PageNumber = 1,
    int PageSize = 10,
    string? ColumnName = null,
    string? Operation = "Contains",
    string? SortDirection = "ASC",
    string? SearchValue = null,
    bool IncludeArchived = false);

public sealed record TenantAdministrationPageMetadata(
    int CurrentPage,
    int TotalPages,
    int PageSize,
    int PageNumber,
    int TotalCount,
    bool HasPrev,
    bool HasNext);

public sealed record TenantAdministrationPage<T>(
    IReadOnlyList<T> Items,
    TenantAdministrationPageMetadata MetaData);

public sealed record TenantManagementRequest(
    string Identifier,
    string Name,
    bool IsActive,
    string SubscriptionStatus,
    DateTime SubscriptionStartedOn,
    DateTime? SubscriptionEndsOn,
    string? PlanName,
    int MaxAdmins,
    int MaxUsers,
    string? BillingEmail,
    string? ContactName,
    string? ContactPhone,
    string? Notes,
    string? RowVersion = null,
    IReadOnlyList<TenantModuleEntitlementRequest>? Entitlements = null);

public sealed record TenantManagementResponse(
    string Id,
    string Identifier,
    string Name,
    bool IsActive,
    string SubscriptionStatus,
    DateTime SubscriptionStartedOn,
    DateTime? SubscriptionEndsOn,
    string? PlanName,
    int MaxAdmins,
    int MaxUsers,
    int AdminCount,
    int UserCount,
    int TotalUserCount,
    int CompanyCount,
    string? BillingEmail,
    string? ContactName,
    string? ContactPhone,
    string? Notes,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string LifecycleStatus,
    DateTime? ArchivedOn,
    string? ArchiveReason,
    DateTime? PurgeScheduledOn,
    string RowVersion,
    IReadOnlyList<TenantModuleEntitlementResponse>? Entitlements = null);

public sealed record TenantDashboardSubscriptionStatusCounts(
    int Free,
    int Trial,
    int Active,
    int PastDue,
    int Suspended,
    int Expired,
    int Cancelled);

public sealed record TenantDashboardRecentTenantResponse(
    string Id,
    string Identifier,
    string Name,
    string SubscriptionStatus);

public sealed record TenantDashboardExpiringTenantResponse(
    string Id,
    string Name,
    string? PlanName,
    DateTime SubscriptionEndsOn);

public sealed record TenantDashboardSummaryResponse(
    int TotalTenants,
    int EnabledTenants,
    int Admins,
    int Users,
    int Companies,
    int MaxAdmins,
    int MaxUsers,
    int ExpiringWithin30Days,
    TenantDashboardSubscriptionStatusCounts SubscriptionStatusCounts,
    IReadOnlyList<TenantDashboardRecentTenantResponse> RecentTenants,
    IReadOnlyList<TenantDashboardExpiringTenantResponse> ExpiringWithin30DaysTenants);

public sealed record ArchiveTenantRequest(
    string Reason,
    DateTime? PurgeScheduledOn,
    string RowVersion);

public sealed record RestoreTenantRequest(string RowVersion);

public interface ITenantManagementFlow
{
    Task<TenantAdministrationPage<TenantManagementResponse>> GetPageAsync(
        TenantAdministrationPageRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantManagementResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantManagementResponse>> CreateAsync(
        TenantManagementRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantManagementResponse>> UpdateAsync(
        string id,
        TenantManagementRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantManagementResponse>> ArchiveAsync(
        string id,
        ArchiveTenantRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantManagementResponse>> RestoreAsync(
        string id,
        RestoreTenantRequest request,
        CancellationToken cancellationToken = default);
}

/// <summary>Platform persistence port for tenant administration.</summary>
public interface ITenantManagementAdapter : ITenantManagementFlow;

/// <summary>Lightweight read port for the super-admin tenant dashboard.</summary>
public interface ITenantDashboardSummaryAdapter
{
    Task<TenantDashboardSummaryResponse> GetSummaryAsync(
        CancellationToken cancellationToken = default);
}

public sealed record CreateTenantAdministratorRequest(
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    string Password,
    IReadOnlyCollection<string> TenantIds,
    string DefaultTenantId);

public sealed record UpdateTenantAdministratorRequest(
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    string? Password,
    bool IsDisabled,
    IReadOnlyCollection<string> TenantIds,
    string DefaultTenantId);

public sealed record TenantAdministratorTenantResponse(
    string Id,
    string Identifier,
    string Name,
    bool IsDefault);

public sealed record TenantAdministratorResponse(
    string Id,
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    bool IsDisabled,
    bool IsLocked,
    string DefaultTenantId,
    IReadOnlyCollection<TenantAdministratorTenantResponse> Tenants,
    IReadOnlyCollection<int> CompanyIds,
    string LifecycleStatus,
    DateTime? ArchivedOn,
    string? ArchiveReason);

public interface ITenantAdministratorFlow
{
    Task<TenantAdministrationPage<TenantAdministratorResponse>> GetPageAsync(
        TenantAdministrationPageRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TenantAdministratorResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantAdministratorResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantAdministratorResponse>> CreateAsync(
        CreateTenantAdministratorRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantAdministratorResponse>> UpdateAsync(
        string id,
        UpdateTenantAdministratorRequest request,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult> ArchiveAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<TenantAdministrationResult<TenantAdministratorResponse>> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default);
}

/// <summary>Platform persistence port for tenant administrator management.</summary>
public interface ITenantAdministratorAdapter : ITenantAdministratorFlow;

/// <summary>Reusable tenancy administration rules owned by Platform.</summary>
public interface ITenantAdministrationPolicy
{
    string NormalizeIdentifier(string identifier);

    IReadOnlyList<string> NormalizeTenantIds(IEnumerable<string> tenantIds);

    bool CanSetSeatLimits(
        int maxAdmins,
        int maxUsers,
        int currentAdminCount,
        int currentUserCount);

    bool HasAdministratorSeat(int maxAdmins, int currentAdminCount);
}
