using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;
using ErpSystem.Modules.Platform.Domain.Security.ApiKeys.Entities;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.ApiKeys.Persistence;

public sealed class ApiKeyReadStore(PlatformDbContext context) : IApiKeyReadStore
{
    public async Task<IReadOnlyCollection<ApiKeyResponse>> GetAllAsync(
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

    public Task<ApiKeyResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default) =>
        context.ApiKeys
            .AsNoTracking()
            .Where(apiKey => apiKey.Id == id)
            .Select(apiKey => new ApiKeyResponse(
                apiKey.Id,
                apiKey.KeyPrefix,
                apiKey.ClientUri,
                apiKey.Description,
                apiKey.IsActive,
                apiKey.CreatedAt,
                apiKey.ExpiresAt,
                apiKey.RevokedAt))
            .FirstOrDefaultAsync(cancellationToken);
}

public sealed class ApiKeyWriteStore(PlatformDbContext context) : IApiKeyWriteStore
{
    public void Add(ApiKey apiKey) => context.ApiKeys.Add(apiKey);

    public Task<ApiKey?> GetForUpdateAsync(
        int id,
        CancellationToken cancellationToken = default) =>
        context.ApiKeys.FirstOrDefaultAsync(apiKey => apiKey.Id == id, cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);
}

public sealed class ApiKeyCredentialGenerator : IApiKeyCredentialGenerator
{
    public ApiKeyCredential Generate()
    {
        var secret = $"hrk_{WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32))}";
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));
        return new ApiKeyCredential(secret, hash, secret[..Math.Min(secret.Length, 12)]);
    }
}

public sealed class ApiKeyEffects(IRealtimeChangeDispatcher realtimeChanges) : IApiKeyEffects
{
    public void DispatchChange(string action, ApiKey apiKey)
    {
        if (string.IsNullOrWhiteSpace(apiKey.TenantId) || apiKey.CompanyId <= 0)
        {
            throw new InvalidOperationException(
                "A tenant and company are required for API key realtime updates.");
        }

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApiKey>(
            RealtimeAudience.ForCompanyPermission(
                apiKey.TenantId,
                apiKey.CompanyId,
                PlatformPermissions.ViewApiKeys),
            action,
            apiKey.Id.ToString(CultureInfo.InvariantCulture)));
    }
}
