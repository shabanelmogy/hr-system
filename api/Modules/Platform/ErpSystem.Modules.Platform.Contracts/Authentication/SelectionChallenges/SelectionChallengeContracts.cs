using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

namespace ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;

/// <summary>
/// Stable selection-challenge scopes. Values intentionally match the existing
/// authentication wire contract exactly.
/// </summary>
public static class SelectionChallengeScopes
{
    public const string TenantSelection = AuthenticationTokenClaimNames.TenantSelectionScope;
    public const string CompanySelection = AuthenticationTokenClaimNames.CompanySelectionScope;
}

public sealed record SelectionChallengeRegistrationRequest(
    string JwtId,
    string UserId,
    string Scope,
    DateTime ExpiresOn,
    string? TenantId);

public sealed record SelectionChallengeConsumeRequest(
    string JwtId,
    string UserId,
    string Scope,
    string? TenantId);

/// <summary>
/// Persistence-neutral challenge state. The application layer owns the clock;
/// the current HR persistence owner supplies atomic storage/consumption.
/// </summary>
public sealed record SelectionChallengeSnapshot(
    string JwtId,
    string UserId,
    string Scope,
    string? TenantId,
    DateTime CreatedOn,
    DateTime ExpiresOn);

public interface ISelectionChallengeSource
{
    Task StoreAsync(
        SelectionChallengeSnapshot challenge,
        DateTime utcNow,
        CancellationToken cancellationToken = default);

    Task<bool> ConsumeAsync(
        SelectionChallengeConsumeRequest request,
        DateTime utcNow,
        CancellationToken cancellationToken = default);
}

public interface ISelectionChallengeService
{
    Task StoreAsync(
        SelectionChallengeRegistrationRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> ConsumeAsync(
        SelectionChallengeConsumeRequest request,
        CancellationToken cancellationToken = default);
}
