using HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Districts.Services;

namespace HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class DistrictsController(IDistrictService districtService) : ControllerBase
{
    private readonly IDistrictService _districtService = districtService;

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.GetAll(System.Threading.CancellationToken)"]/*' />
    [HttpGet]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(IEnumerable<DistrictResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var districts = await _districtService.GetAllAsync(cancellationToken);
        return Ok(districts);
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.GetAllByState(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("by-state/{stateId}")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(IEnumerable<DistrictResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllByState([FromRoute] int stateId, CancellationToken cancellationToken)
    {
        var districts = await _districtService.GetAllByStateAsync(stateId, cancellationToken);
        return Ok(districts);
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.GetByID(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(DistrictResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _districtService.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.GetDistrictWithAddresses(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("{id}/addresses")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(DistrictResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDistrictWithAddresses([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _districtService.GetRelatedAddresses(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.Add(HrManagementSystem.Features.GeographicalInformation.Districts.Contracts.DistrictRequest,System.Threading.CancellationToken)"]/*' />
    [HttpPost]
    [HasPermission(Permissions.CreateDistricts)]
    [ProducesResponseType(typeof(DistrictResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Add([FromBody] DistrictRequest request, CancellationToken cancellationToken)
    {
        var result = await _districtService.AddAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.Update(HrManagementSystem.Features.GeographicalInformation.Districts.Contracts.DistrictRequest,System.Threading.CancellationToken)"]/*' />
    [HttpPut]
    [HasPermission(Permissions.EditDistricts)]
    [ProducesResponseType(typeof(DistrictResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] DistrictRequest request, CancellationToken cancellationToken)
    {
        var result = await _districtService.UpdateAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.Delete(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteDistricts)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _districtService.ToggleAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/DistrictsController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Districts.Controllers.V1.DistrictsController.GetCount(System.Threading.CancellationToken)"]/*' />
    [HttpGet("count")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(DistrictsCountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        var result = await _districtService.GetCountAsync(cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
