using HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;
using HrManagementSystem.Application.Features.Security.ApiKeys.Errors;
using HrManagementSystem.Application.Features.Security.ApiKeys.Services;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Security.ApiKeys.Entities;
using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Features.Security.ApiKeys.Services;

public sealed class ApiKeyService(
    ApplicationDbContext context,
    ApiKeyErrors apiKeyErrors,
    TimeProvider timeProvider,
    IRealtimeChangeDispatcher realtimeChanges) : IApiKeyService
{
    public async Task<IReadOnlyCollection<ApiKeyResponse>> GetAllApiKeysAsync(
        CancellationToken cancellationToken = default) =>
        await context.ApiKeys
            .AsNoTracking()
            .OrderByDescending(apiKey => apiKey.CreatedAt)
            .Select(apiKey => new ApiKeyResponse(
                apiKey.Id,
                apiKey.KeyPrefix,
                apiKey.ClientUri,
                apiKey.Description,
                apiKey.IsActive,
                apiKey.CreatedAt,
                apiKey.ExpiresAt,
                apiKey.RevokedAt))
            .ToListAsync(cancellationToken);

    public async Task<Result<ApiKeyResponse>> GetApiKeyAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var apiKey = await context.ApiKeys
            .AsNoTracking()
            .FirstOrDefaultAsync(key => key.Id == id, cancellationToken);

        return apiKey is not null
            ? Result.Success(ToResponse(apiKey))
            : Result.Failure<ApiKeyResponse>(apiKeyErrors.ApiKeyNotFound);
    }

    public async Task<Result<CreatedApiKeyResponse>> AddAsync(
        CreateApiKeyRequest request,
        CancellationToken cancellationToken = default)
    {
        var secret = $"hrk_{WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32))}";
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var apiKey = ApiKey.Create(
            Hash(secret),
            secret[..Math.Min(secret.Length, 12)],
            request.ClientUri,
            request.Description,
            now,
            request.ExpiresAt);

        await context.ApiKeys.AddAsync(apiKey, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        DispatchChange("Create", apiKey.Id);

        return Result.Success(new CreatedApiKeyResponse(ToResponse(apiKey), secret));
    }

    public async Task<Result<ApiKeyResponse>> UpdateAsync(
        UpdateApiKeyRequest request,
        CancellationToken cancellationToken = default)
    {
        var apiKey = await context.ApiKeys
            .FirstOrDefaultAsync(key => key.Id == request.Id, cancellationToken);

        if (apiKey is null)
            return Result.Failure<ApiKeyResponse>(apiKeyErrors.ApiKeyNotFound);

        try
        {
            apiKey.UpdateDetails(
                request.ClientUri,
                request.Description,
                request.ExpiresAt,
                timeProvider.GetUtcNow().UtcDateTime);
        }
        catch (DomainRuleException exception) when (exception.Code == "ApiKey.Revoked")
        {
            return Result.Failure<ApiKeyResponse>(apiKeyErrors.ApiKeyRevoked);
        }

        await context.SaveChangesAsync(cancellationToken);
        DispatchChange("Update", apiKey.Id);
        return Result.Success(ToResponse(apiKey));
    }

    public async Task<Result> RevokeApiKeyAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var apiKey = await context.ApiKeys
            .FirstOrDefaultAsync(key => key.Id == id, cancellationToken);

        if (apiKey is null)
            return Result.Failure(apiKeyErrors.ApiKeyNotFound);

        apiKey.Revoke("Revoked by an administrator", timeProvider.GetUtcNow().UtcDateTime);
        await context.SaveChangesAsync(cancellationToken);
        DispatchChange("Revoke", apiKey.Id);
        return Result.Success();
    }

    private void DispatchChange(string action, int entityId)
    {
        var apiKey = context.ApiKeys.Local.Single(key => key.Id == entityId);
        if (string.IsNullOrWhiteSpace(apiKey.TenantId) || apiKey.CompanyId <= 0)
        {
            throw new InvalidOperationException("A tenant and company are required for API key realtime updates.");
        }

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApiKey>(
            RealtimeAudience.ForCompanyPermission(apiKey.TenantId, apiKey.CompanyId, Permissions.ViewApiKeys),
            action,
            entityId.ToString(CultureInfo.InvariantCulture)));
    }

    private static ApiKeyResponse ToResponse(ApiKey apiKey) =>
        new(
            apiKey.Id,
            apiKey.KeyPrefix,
            apiKey.ClientUri,
            apiKey.Description,
            apiKey.IsActive,
            apiKey.CreatedAt,
            apiKey.ExpiresAt,
            apiKey.RevokedAt);

    private static string Hash(string secret) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));
}
