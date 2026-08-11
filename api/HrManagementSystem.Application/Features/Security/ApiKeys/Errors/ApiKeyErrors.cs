using HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;

namespace HrManagementSystem.Application.Features.Security.ApiKeys.Errors;

public sealed class ApiKeyErrors(IStringLocalizer<CreateApiKeyRequest> localizer)
{
    private readonly IStringLocalizer<CreateApiKeyRequest> _localizer = localizer;

    public Error ApiKeyExists =>
        new("ApiKey.Duplicated", _localizer[nameof(ApiKeyExists)], ErrorType.Conflict);

    public Error ApiKeyNotFound =>
        new("ApiKey.NotFound", _localizer[nameof(ApiKeyNotFound)], ErrorType.NotFound);

    public Error ApiKeyRevoked =>
        new("ApiKey.Revoked", _localizer[nameof(ApiKeyRevoked)], ErrorType.Conflict);
}
