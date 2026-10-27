using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Platform.CompanyEmailTemplates.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/company-email-templates")]
[ApiController]
[TenantMember]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class CompanyEmailTemplatesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(PlatformPermissions.ViewCompanyEmailTemplates)]
    public async Task<IActionResult> Get([FromQuery] EmailTemplateCriteria criteria, CancellationToken token)
    {
        var result = await sender.Send(new GetCompanyEmailTemplatesQuery(criteria), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpPost("{id}/preview")]
    [HasPermission(PlatformPermissions.ViewCompanyEmailTemplates)]
    public async Task<IActionResult> Preview(string id, [FromBody] PreviewEmailTemplateRequest request, CancellationToken token)
    {
        var result = await sender.Send(new PreviewCompanyEmailTemplateQuery(id, request), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
    [HttpPut("{id}")]
    [HasPermission(PlatformPermissions.EditCompanyEmailTemplates)]
    public async Task<IActionResult> Change(string id, [FromBody] ChangeEmailTemplateRequest request, CancellationToken token)
    {
        var result = await sender.Send(new ChangeCompanyEmailTemplateCommand(id, request), token);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
    [HttpPost("{id}/reset")]
    [HasPermission(PlatformPermissions.ResetCompanyEmailTemplates)]
    public async Task<IActionResult> Reset(string id, [FromBody] ResetEmailTemplateRequest request, CancellationToken token)
    {
        var result = await sender.Send(new ResetCompanyEmailTemplateCommand(id, request), token);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
