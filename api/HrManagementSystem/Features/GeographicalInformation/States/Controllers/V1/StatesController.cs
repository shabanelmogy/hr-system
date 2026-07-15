using HrManagementSystem.Features.GeographicalInformation.States.Contracts;

using HrManagementSystem.Features.GeographicalInformation.States.Services;

namespace HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class StatesController(IStateService stateService) : ControllerBase
{
    private readonly IStateService _stateService = stateService;

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.GetAll(System.Threading.CancellationToken)"]/*' />
    [HttpGet]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(IEnumerable<StateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var states = await _stateService.GetAllAsync(cancellationToken);
        return Ok(states);
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.GetAllByCountry(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("by-country/{countryId}")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(IEnumerable<StateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllByCountry([FromRoute] int countryId, CancellationToken cancellationToken)
    {
        var states = await _stateService.GetAllByCountryAsync(countryId, cancellationToken);
        return Ok(states);
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.GetByID(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(StateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _stateService.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.GetStateWithDistricts(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("{id}/districts")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(StateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetStateWithDistricts([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _stateService.GetRelatedDistricts(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.Add(HrManagementSystem.Features.GeographicalInformation.States.Contracts.StateRequest,System.Threading.CancellationToken)"]/*' />
    [HttpPost]
    [HasPermission(Permissions.CreateStates)]
    [ProducesResponseType(typeof(StateResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Add([FromBody] StateRequest request, CancellationToken cancellationToken)
    {
        var result = await _stateService.AddAsync(request, cancellationToken);
        return result.IsSuccess ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value) : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.Update(HrManagementSystem.Features.GeographicalInformation.States.Contracts.StateRequest,System.Threading.CancellationToken)"]/*' />
    [HttpPut]
    [HasPermission(Permissions.EditStates)]
    [ProducesResponseType(typeof(StateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] StateRequest request, CancellationToken cancellationToken)
    {
        var result = await _stateService.UpdateAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.Delete(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteStates)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _stateService.ToggleDeleteAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/StatesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.States.Controllers.V1.StatesController.GetCount(System.Threading.CancellationToken)"]/*' />
    [HttpGet("count")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(StatesCountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        var result = await _stateService.GetCountAsync(cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
