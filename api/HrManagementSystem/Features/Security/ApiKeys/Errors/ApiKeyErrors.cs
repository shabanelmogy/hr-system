using HrManagementSystem.Features.Security.ApiKeys.Contracts;

namespace HrManagementSystem.Features.Security.ApiKeys.Errors
{
    public class ApiKeyErrors(IStringLocalizer<ApiKeyRequest> localizer)
    {
        private readonly IStringLocalizer<ApiKeyRequest> _localizer = localizer;

        public Error ApiKeyExists =>
                new("apiKey.Duplicated", _localizer[nameof(ApiKeyExists)], StatusCodes.Status409Conflict);

        public Error ApiKeyNotFound =>
                new("apiKey.apiKeyNotFound", _localizer[nameof(ApiKeyNotFound)], StatusCodes.Status404NotFound);
    }

}
