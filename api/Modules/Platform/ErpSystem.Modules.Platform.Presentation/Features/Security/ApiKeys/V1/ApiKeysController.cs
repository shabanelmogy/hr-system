using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Commands;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Queries;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.ApiKeys.V1
{
    [ApiVersion("1.0")]
    [Route(ApiRoutes.BaseRoute)]
    [ApiController]
    [TenantMember]
    public class ApiKeysController(ISender sender) : ControllerBase
    {
        [HttpGet]
        [HasPermission(PlatformPermissions.ViewApiKeys)]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var keys = await sender.Send(new GetAllApiKeysQuery(), cancellationToken);
            return Ok(keys);
        }

        [HttpGet("{id:int}")]
        [HasPermission(PlatformPermissions.ViewApiKeys)]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var response = await sender.Send(new GetApiKeyQuery(id), cancellationToken);

            return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
        }

        [HttpPost]
        [HasPermission(PlatformPermissions.CreateApiKeys)]
        public async Task<IActionResult> Add(
            [FromBody] CreateApiKeyRequest request,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new CreateApiKeyCommand(request), cancellationToken);

            return response.IsSuccess
                ? CreatedAtAction(
                    nameof(Get),
                    new { id = response.Value.ApiKey.Id },
                    response.Value)
                : response.ToProblem();
        }

        [HttpPut]
        [HasPermission(PlatformPermissions.EditApiKeys)]
        public async Task<IActionResult> Update(
            [FromBody] UpdateApiKeyRequest request,
            CancellationToken cancellationToken)
        {
            var response = await sender.Send(new UpdateApiKeyCommand(request), cancellationToken);

            return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
        }

        [HttpPost("{id:int}/revoke")]
        [HasPermission(PlatformPermissions.RevokeApiKeys)]
        public async Task<IActionResult> Revoke(int id, CancellationToken cancellationToken)
        {
            var result = await sender.Send(new RevokeApiKeyCommand(id), cancellationToken);

            return result.IsSuccess ? NoContent() : result.ToProblem();
        }
    }
}
