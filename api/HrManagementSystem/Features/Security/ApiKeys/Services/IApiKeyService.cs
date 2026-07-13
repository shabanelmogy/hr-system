using HrManagementSystem.Features.Security.ApiKeys.Contracts;

namespace HrManagementSystem.Features.Security.ApiKeys.Services
{
    public interface IApiKeyService
    {
        Task<Result<ApiKeyResponse>> AddAsync(ApiKeyRequest apiKeyRequest);
        Task<Result<ApiKeyResponse>> UpdateAync(ApiKeyRequest updatedRequest);
        Task<Result<ApiKeyResponse>> GetApiKeyAsync(int id);
        Task<IEnumerable<ApiKeyResponse>> GetAllApiKeysAsync();
        Task<Result> RevokeApiKeyAsync(int id);
    }
}