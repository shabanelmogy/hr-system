namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;

/// <summary>
/// HR-owned persistence projection for the existing selection-challenge table.
/// </summary>
public sealed record SelectionChallengePersistenceRecord(
    string JwtId,
    string UserId,
    string Scope,
    string? TenantId,
    DateTime CreatedOn,
    DateTime ExpiresOn);
