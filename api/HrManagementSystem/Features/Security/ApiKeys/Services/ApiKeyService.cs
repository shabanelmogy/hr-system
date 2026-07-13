using HrManagementSystem.Features.Security.ApiKeys.Contracts;

namespace HrManagementSystem.Features.Security.ApiKeys.Services;

public class ApiKeyService : IApiKeyService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ApiKeyErrors _apiKeyErrors;

    public ApiKeyService(ApplicationDbContext context, IMapper mapper, ApiKeyErrors apiKeyErrors)
    {
        _context = context;
        _mapper = mapper;
        _apiKeyErrors = apiKeyErrors;
    }
    public async Task<IEnumerable<ApiKeyResponse>> GetAllApiKeysAsync()
    {
        return await _context.ApiKeys
            .Select(apiKey => _mapper.Map<ApiKeyResponse>(apiKey))
            .ToListAsync();
    }
    public async Task<Result<ApiKeyResponse>> GetApiKeyAsync(int id)
    {
        var response = await _context.ApiKeys.FindAsync(id);

        return response is not null
          ? Result.Success(response.Adapt<ApiKeyResponse>())
              : Result.Failure<ApiKeyResponse>(_apiKeyErrors.ApiKeyNotFound);
    }
    public async Task<Result<ApiKeyResponse>> AddAsync(ApiKeyRequest apiKeyRequest)
    {
        var newApiKey = _mapper.Map<ApiKey>(apiKeyRequest);

        _context.ApiKeys.Add(newApiKey);
        await _context.SaveChangesAsync();

        var response = newApiKey.Adapt<ApiKeyResponse>();

        return Result.Success(_mapper.Map<ApiKeyResponse>(response));
    }

    public async Task<Result<ApiKeyResponse>> UpdateAync(ApiKeyRequest updatedRequest)
    {
        // Try to find the existing API key
        var existingApiKey = await _context.ApiKeys.FindAsync(updatedRequest.Id);

        // If not found, return failure
        if (existingApiKey is null)
            return Result.Failure<ApiKeyResponse>(_apiKeyErrors.ApiKeyNotFound);

        // Update the properties using Mapster or manually
        _mapper.Map(updatedRequest, existingApiKey);

        // Save the changes to the database
        await _context.SaveChangesAsync();

        // Map the updated entity to the response DTO
        var response = existingApiKey.Adapt<ApiKeyResponse>();
        return Result.Success(response);
    }


    public async Task<Result> RevokeApiKeyAsync(int id)
    {
        // Find the API key by ID
        var apiKey = await _context.ApiKeys.FindAsync(id);

        // Check if the API key exists
        if (apiKey == null)
            return Result.Failure(_apiKeyErrors.ApiKeyNotFound);

        // Revoke the API key by setting IsActive to false
        apiKey.IsActive = false;

        // Save the changes to the database
        await _context.SaveChangesAsync();

        // Return success result
        return Result.Success();
    }
}
