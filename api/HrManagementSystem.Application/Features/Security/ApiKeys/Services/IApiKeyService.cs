using HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;

namespace HrManagementSystem.Application.Features.Security.ApiKeys.Services;

public interface IApiKeyService
{
    Task<Result<CreatedApiKeyResponse>> AddAsync(
        CreateApiKeyRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<ApiKeyResponse>> UpdateAsync(
        UpdateApiKeyRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<ApiKeyResponse>> GetApiKeyAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<ApiKeyResponse>> GetAllApiKeysAsync(
        CancellationToken cancellationToken = default);

    Task<Result> RevokeApiKeyAsync(
        int id,
        CancellationToken cancellationToken = default);
}
