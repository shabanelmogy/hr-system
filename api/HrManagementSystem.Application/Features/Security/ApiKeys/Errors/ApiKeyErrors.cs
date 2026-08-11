using HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;

namespace HrManagementSystem.Application.Features.Security.ApiKeys.Errors
{
    public class ApiKeyErrors(IStringLocalizer<ApiKeyRequest> localizer)
    {
        private readonly IStringLocalizer<ApiKeyRequest> _localizer = localizer;

        public Error ApiKeyExists =>
                new("apiKey.Duplicated", _localizer[nameof(ApiKeyExists)], ErrorType.Conflict);

        public Error ApiKeyNotFound =>
                new("apiKey.apiKeyNotFound", _localizer[nameof(ApiKeyNotFound)], ErrorType.NotFound);
    }

}
