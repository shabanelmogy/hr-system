using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Commands;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.OrganizationalStructure.CompanyGeographicScope.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/company-geographic-scope")]
[ApiController]
[TenantMember]
public sealed class CompanyGeographicScopeController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewCompanyGeographicScope)]
    [ProducesResponseType(typeof(CompanyGeographicScopeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCompanyGeographicScopeQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.ManageCompanyGeographicScope)]
    [ProducesResponseType(typeof(CompanyGeographicScopeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status423Locked)]
    public async Task<IActionResult> Update(
        [FromBody] UpdateCompanyGeographicScopeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateCompanyGeographicScopeCommand(
                request.CountryIds,
                request.DefaultCountryId,
                request.RegistrationCountryId),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
