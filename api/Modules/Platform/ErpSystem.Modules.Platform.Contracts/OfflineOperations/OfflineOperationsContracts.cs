namespace ErpSystem.Modules.Platform.Contracts.OfflineOperations;

/// <summary>Canonical permission for tenant/company offline policy administration.</summary>
public static class OfflineOperationsPermissions
{
    public const string Manage = "OfflineOperations:Manage";
}

/// <summary>Stable capability identifiers shared by API policy and clients.</summary>
public static class OfflineOperationCapabilityIds
{
    public const string CountriesRead = "countries.read";
    public const string WorkforcePlanUpdateDraft = "workforce-plan.update-draft";
}

/// <summary>Wire-stable offline execution mode names.</summary>
public static class OfflineOperationModes
{
    public const string OnlineOnly = "online-only";
    public const string OfflineRead = "offline-read";
    public const string OfflineDraft = "offline-draft";
    public const string OfflineCommand = "offline-command";

    public static IReadOnlyList<string> All { get; } =
    [
        OnlineOnly,
        OfflineRead,
        OfflineDraft,
        OfflineCommand
    ];
}

public sealed record OfflineOperationCapabilityResponse(
    string Id,
    IReadOnlyList<string> SupportedModes);

public sealed record OfflineOperationsPolicyResponse(
    int Version,
    string TenantId,
    int CompanyId,
    IReadOnlyDictionary<string, string> Modes,
    IReadOnlyList<OfflineOperationCapabilityResponse> Capabilities,
    string? RowVersion,
    DateTimeOffset? UpdatedOn,
    string? UpdatedByUserId);

public sealed record UpdateOfflineOperationsPolicyRequest(
    IReadOnlyDictionary<string, string> Modes,
    string? RowVersion);

/// <summary>
/// Platform-owned application facade. Reads are available to the active tenant/company;
/// writes are authorization-gated by the presentation endpoint.
/// </summary>
public interface IOfflineOperationsPolicyService
{
    Task<OfflineOperationsPolicyResponse> GetCurrentAsync(
        CancellationToken cancellationToken = default);

    Task<OfflineOperationsPolicyResponse> UpdateCurrentAsync(
        UpdateOfflineOperationsPolicyRequest request,
        CancellationToken cancellationToken = default);
}

public sealed record OfflineOperationsPolicyStoreRecord(
    string TenantId,
    int CompanyId,
    IReadOnlyDictionary<string, string> Modes,
    byte[] RowVersion,
    DateTimeOffset UpdatedOn,
    string? UpdatedByUserId);

public sealed record SaveOfflineOperationsPolicyRequest(
    string TenantId,
    int CompanyId,
    IReadOnlyDictionary<string, string> Modes,
    byte[]? ExpectedRowVersion,
    DateTimeOffset UpdatedOn,
    string UpdatedByUserId);

public interface IOfflineOperationsPolicyStore
{
    Task<OfflineOperationsPolicyStoreRecord?> GetAsync(
        string tenantId,
        int companyId,
        CancellationToken cancellationToken = default);

    Task<OfflineOperationsPolicyStoreRecord> SaveAsync(
        SaveOfflineOperationsPolicyRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class OfflineOperationsPolicyConflictException(string message) : Exception(message);

public sealed class OfflineOperationsPolicyValidationException(string message) : Exception(message);

public sealed class OfflineOperationsPolicyScopeException(string message) : Exception(message);
