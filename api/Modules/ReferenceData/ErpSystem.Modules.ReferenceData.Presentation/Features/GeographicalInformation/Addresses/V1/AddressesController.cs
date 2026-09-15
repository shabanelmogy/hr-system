using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Commands;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Queries;
using MediatR;

namespace ErpSystem.Modules.ReferenceData.Presentation.Features.GeographicalInformation.Addresses.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
public class AddressesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(ReferenceDataPermissions.ViewAddresses)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var addresses = await sender.Send(new GetAddressesQuery(), cancellationToken);
        return Ok(addresses);
    }

    [HttpGet("{id}")]
    [HasPermission(ReferenceDataPermissions.ViewAddresses)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetAddressByIdQuery(id), cancellationToken);

        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpGet("{id}/details")]
    [HasPermission(ReferenceDataPermissions.ViewAddresses)]
    public async Task<IActionResult> GetAddressWithDetails([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetAddressDetailsQuery(id), cancellationToken);

        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(ReferenceDataPermissions.CreateAddresses)]
    public async Task<IActionResult> Add([FromBody] AddressRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateAddressCommand(request), cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("")]
    [HasPermission(ReferenceDataPermissions.EditAddresses)]
    public async Task<IActionResult> Update([FromBody] AddressRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateAddressCommand(request), cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(ReferenceDataPermissions.DeleteAddresses)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ToggleAddressCommand(id), cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet("count")]
    [HasPermission(ReferenceDataPermissions.ViewAddresses)]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAddressCountQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
