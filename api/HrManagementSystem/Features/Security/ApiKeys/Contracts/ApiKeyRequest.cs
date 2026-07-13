namespace HrManagementSystem.Features.Security.ApiKeys.Contracts
{
    public record ApiKeyRequest(
        int Id,
        string Key,
        string ClientUri,
        string Description,
        bool IsActive,
        DateTime? ExpiresAt
    );
}