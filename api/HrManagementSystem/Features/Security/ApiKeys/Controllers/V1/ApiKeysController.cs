using HrManagementSystem.Features.Security.ApiKeys.Contracts;
using HrManagementSystem.Features.Security.ApiKeys.Services;

namespace HrManagementSystem.Features.Security.ApiKeys.Controllers.V1
{
    [ApiVersion("1.0")]
    [Route(ApiRoutes.BaseRoute)]
    [ApiController]
    public class ApiKeysController(IApiKeyService apiKeyService) : ControllerBase
    {
        private readonly IApiKeyService _apiKeyService = apiKeyService;

        [HttpGet]
        [HasPermission(Permissions.ViewApiKeys)]
        public async Task<IActionResult> GetAll()
        {
            var keys = await _apiKeyService.GetAllApiKeysAsync();
            return Ok(keys);
        }

        [HttpGet("{id:int}")]
        [HasPermission(Permissions.ViewApiKeys)]
        public async Task<IActionResult> Get(int id)
        {
            var response = await _apiKeyService.GetApiKeyAsync(id);

            return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
        }

        [HttpPost]
        [HasPermission(Permissions.CreateApiKeys)]
        public async Task<IActionResult> Add([FromBody] ApiKeyRequest request)
        {
            var response = await _apiKeyService.AddAsync(request);

            return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
        }

        [HttpPut]
        [HasPermission(Permissions.EditApiKeys)]
        public async Task<IActionResult> Update([FromBody] ApiKeyRequest request)
        {
            var response = await _apiKeyService.UpdateAync(request);

            return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
        }

        [HttpPost("{id:int}/revoke")]
        [HasPermission(Permissions.DeleteApiKeys)]
        public async Task<IActionResult> Revoke(int id)
        {
            var result = await _apiKeyService.RevokeApiKeyAsync(id);

            return result.IsSuccess ? NoContent() : result.ToProblem();
        }
    }
}
