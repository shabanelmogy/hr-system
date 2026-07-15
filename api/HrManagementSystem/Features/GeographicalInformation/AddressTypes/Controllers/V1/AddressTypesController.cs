using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Services;

namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class AddressTypesController(IAddressTypeService addressTypeService) : ControllerBase
{
    private readonly IAddressTypeService _addressTypeService = addressTypeService;

    [HttpGet]
    [HasPermission(Permissions.ViewAddressTypes)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var addressTypes = await _addressTypeService.GetAllAsync(cancellationToken);
        return Ok(addressTypes);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewAddressTypes)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _addressTypeService.GetAsync(id, cancellationToken);

        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpGet("{id}/addresses")]
    [HasPermission(Permissions.ViewAddressTypes)]
    public async Task<IActionResult> GetAddressTypeWithAddresses([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _addressTypeService.GetRelatedAddresses(id, cancellationToken);

        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateAddressTypes)]
    public async Task<IActionResult> Add([FromBody] AddressTypeRequest request, CancellationToken cancellationToken)
    {
        var result = await _addressTypeService.AddAsync(request, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("")]
    [HasPermission(Permissions.EditAddressTypes)]
    public async Task<IActionResult> Update([FromBody] AddressTypeRequest request, CancellationToken cancellationToken)
    {
        var result = await _addressTypeService.UpdateAsync(request, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteAddressTypes)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _addressTypeService.ToggleAsync(id, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet("count")]
    [HasPermission(Permissions.ViewAddressTypes)]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        var result = await _addressTypeService.GetCountAsync(cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
