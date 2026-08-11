using HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;
using HrManagementSystem.Application.Features.Security.ApiKeys.Services;

namespace HrManagementSystem.Api.Features.Security.ApiKeys.V1
{
    [ApiVersion("1.0")]
    [Route(ApiRoutes.BaseRoute)]
    [ApiController]
    public class ApiKeysController(IApiKeyService apiKeyService) : ControllerBase
    {
        private readonly IApiKeyService _apiKeyService = apiKeyService;

        [HttpGet]
        [HasPermission(Permissions.ViewApiKeys)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var keys = await _apiKeyService.GetAllApiKeysAsync(cancellationToken);
            return Ok(keys);
        }

        [HttpGet("{id:int}")]
        [HasPermission(Permissions.ViewApiKeys)]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var response = await _apiKeyService.GetApiKeyAsync(id, cancellationToken);

            return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
        }

        [HttpPost]
        [HasPermission(Permissions.CreateApiKeys)]
        public async Task<IActionResult> Add(
            [FromBody] CreateApiKeyRequest request,
            CancellationToken cancellationToken)
        {
            var response = await _apiKeyService.AddAsync(request, cancellationToken);

            return response.IsSuccess
                ? CreatedAtAction(
                    nameof(Get),
                    new { id = response.Value.ApiKey.Id },
                    response.Value)
                : response.ToProblem();
        }

        [HttpPut]
        [HasPermission(Permissions.EditApiKeys)]
        public async Task<IActionResult> Update(
            [FromBody] UpdateApiKeyRequest request,
            CancellationToken cancellationToken)
        {
            var response = await _apiKeyService.UpdateAsync(request, cancellationToken);

            return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
        }

        [HttpPost("{id:int}/revoke")]
        [HasPermission(Permissions.DeleteApiKeys)]
        public async Task<IActionResult> Revoke(int id, CancellationToken cancellationToken)
        {
            var result = await _apiKeyService.RevokeApiKeyAsync(id, cancellationToken);

            return result.IsSuccess ? NoContent() : result.ToProblem();
        }
    }
}
