namespace ErpSystem.Modules.HR.Application.Features.Security.ApiKeys.Contracts;

public sealed record CreateApiKeyRequest(
    string ClientUri,
    string Description,
    DateTime? ExpiresAt);
