using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;
using ErpSystem.Modules.Platform.Domain.Security.ApiKeys.Entities;

namespace ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Abstractions;

public interface IApiKeyReadStore
{
    Task<IReadOnlyCollection<ApiKeyResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApiKeyResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}

public interface IApiKeyWriteStore
{
    void Add(ApiKey apiKey);
    Task<ApiKey?> GetForUpdateAsync(int id, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed record ApiKeyCredential(string Secret, string Hash, string Prefix);

public interface IApiKeyCredentialGenerator
{
    ApiKeyCredential Generate();
}

public interface IApiKeyEffects
{
    void DispatchChange(string action, ApiKey apiKey);
}
