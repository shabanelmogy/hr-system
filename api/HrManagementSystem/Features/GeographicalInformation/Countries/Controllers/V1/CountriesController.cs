using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Countries.Services;

namespace HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[Authorize]
public class CountriesController(ICountryService countryService) : ControllerBase
{
    private readonly ICountryService _countryService = countryService;

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.GetAll(System.Threading.CancellationToken)"]/*' />
    [HttpGet]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(IEnumerable<CountryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var countries = await _countryService.GetAllAsync(cancellationToken);
        return Ok(countries);
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.GetByID(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("{id}")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByID([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _countryService.GetAsync(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.GetCountryWithStates(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpGet("{id}/states")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCountryWithStates([FromRoute] int id, CancellationToken cancellationToken)
    {
        var response = await _countryService.GetRelatedStates(id, cancellationToken);
        return response.IsSuccess ? Ok(response.Value) : response.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.Add(HrManagementSystem.Features.GeographicalInformation.Countries.Contracts.CountryRequest,System.Threading.CancellationToken)"]/*' />
    [HttpPost]
    [HasPermission(Permissions.CreateCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Add([FromBody] CountryRequest request, CancellationToken cancellationToken)
    {
        var result = await _countryService.AddAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.AddRange(System.Collections.Generic.List{HrManagementSystem.Features.GeographicalInformation.Countries.Contracts.CountryRequest},System.Threading.CancellationToken)"]/*' />
    [HttpPost("bulk")]
    [HasPermission(Permissions.CreateCountries)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AddRange([FromBody] List<CountryRequest> requests, CancellationToken cancellationToken)
    {
        var result = await _countryService.AddRangeAsync(requests, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.Update(HrManagementSystem.Features.GeographicalInformation.Countries.Contracts.CountryRequest,System.Threading.CancellationToken)"]/*' />
    [HttpPut("")]
    [HasPermission(Permissions.EditCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] CountryRequest request, CancellationToken cancellationToken)
    {
        var result = await _countryService.UpdateAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByID), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.Delete(System.Int32,System.Threading.CancellationToken)"]/*' />
    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteCountries)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _countryService.ToggleDeleteAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <include file='../../../../../Docs/Controllers/Geographic/xml/CountriesController.xml' path='doc/members/member[@name="M:HrManagementSystem.Features.GeographicalInformation.Countries.Controllers.V1.CountriesController.GetCount(System.Threading.CancellationToken)"]/*' />
    [HttpGet("count")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountriesCountResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        var result = await _countryService.GetCountAsync(cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
