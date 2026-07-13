using HrManagementSystem.Features.GeographicalInformation.Addresses.Services;

namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class AddressesController(IAddressService addressService) : ControllerBase
{
    private readonly IAddressService _addressService = addressService;

    [HttpGet]
    [HasPermission(Permissions.ViewAddresses)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var addresses = await _addressService.GetAllAsync(cancellationToken);
        return Ok(addresses);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewAddresses)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _addressService.GetAsync(id, cancellationToken);

        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpGet("{id}/details")]
    [HasPermission(Permissions.ViewAddresses)]
    public async Task<IActionResult> GetAddressWithDetails([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _addressService.GetWithRelatedEntities(id, cancellationToken);

        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateAddresses)]
    public async Task<IActionResult> Add([FromBody] AddressRequest request, CancellationToken cancellationToken)
    {
        var result = await _addressService.AddAsync(request, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    [HttpPut("")]
    [HasPermission(Permissions.EditAddresses)]
    public async Task<IActionResult> Update([FromBody] AddressRequest request, CancellationToken cancellationToken)
    {
        var result = await _addressService.UpdateAsync(request, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteAddresses)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _addressService.ToggleAsync(id, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet("count")]
    [HasPermission(Permissions.ViewAddresses)]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        var result = await _addressService.GetCountAsync(cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
