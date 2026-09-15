namespace ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;

public sealed record UpdateApiKeyRequest(
    int Id,
    string ClientUri,
    string Description,
    DateTime? ExpiresAt);
