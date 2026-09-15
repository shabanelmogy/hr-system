namespace ErpSystem.Modules.Platform.Application.OfflineOperations;

/// <summary>Stable capability identifiers emitted by the Platform offline-policy API.</summary>
public static class OfflineOperationCapabilityIds
{
    public const string CountriesRead = "countries.read";
    public const string WorkforcePlanUpdateDraft = "workforce-plan.update-draft";
}

/// <summary>Wire-stable offline execution mode names owned by Platform policy.</summary>
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
