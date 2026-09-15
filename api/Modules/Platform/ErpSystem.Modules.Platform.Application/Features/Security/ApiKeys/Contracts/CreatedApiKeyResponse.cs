namespace ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;

public sealed record CreatedApiKeyResponse(ApiKeyResponse ApiKey, string Secret);
