using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.ArchiveCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.RestoreCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryById;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryLookup;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryWithStates;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryReportData;
using MediatR;

namespace HrManagementSystem.Api.Features.GeographicalInformation.Countries.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[Authorize(Roles = AppRoles.super_admin)]
public sealed class CountriesController(ISender sender) : ControllerBase
{
    /// <summary>Returns a server-paged country collection with explicit status filtering.</summary>
    [HttpGet]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(PageResponse<CountryListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPage(
        [FromQuery] GetCountriesQuery query,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(query, cancellationToken));

    /// <summary>Returns lightweight active countries for selectors.</summary>
    [HttpGet("lookup")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(IReadOnlyList<SimpleCountryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLookup(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetCountryLookupQuery(), cancellationToken));

    /// <summary>Returns the approved, active Countries JSON dataset for tenant report rendering.</summary>
    /// <remarks>
    /// This endpoint is the only Countries data source approved for browser-authored report
    /// templates. The stored report contains the relative API endpoint, never a database
    /// connection string, credential, or environment-specific host.
    /// </remarks>
    [HttpGet("report-data")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(IReadOnlyList<CountryReportDataResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetReportData(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetCountryReportDataQuery(), cancellationToken));

    /// <summary>Returns one country, including an archived country, without loading its states.</summary>
    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountryDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCountryByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Returns one country with its active states.</summary>
    [HttpGet("{id:int}/states")]
    [HasPermission(Permissions.ViewCountries)]
    [ProducesResponseType(typeof(CountryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetWithStates(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCountryWithStatesQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Creates one country.</summary>
    [HttpPost]
    [HasPermission(Permissions.CreateCountries)]
    [ProducesResponseType(typeof(CountryDetailResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCountryCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Creates up to 100 countries atomically.</summary>
    [HttpPost("bulk")]
    [HasPermission(Permissions.CreateCountries)]
    [ProducesResponseType(typeof(CreateCountriesResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateBulk(
        [FromBody] CreateCountriesRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateCountriesCommand(request.Countries),
            cancellationToken);
        return result.IsSuccess
            ? StatusCode(StatusCodes.Status201Created, result.Value)
            : result.ToProblem();
    }

    /// <summary>Updates one active country.</summary>
    [HttpPut("{id:int}")]
    [HasPermission(Permissions.EditCountries)]
    [ProducesResponseType(typeof(CountryDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(
        [FromRoute] int id,
        [FromBody] UpdateCountryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateCountryCommand(
                id,
                request.NameAr,
                request.NameEn,
                request.Alpha2Code,
                request.Alpha3Code,
                request.PhoneCode,
                request.CurrencyCode),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Archives one active country.</summary>
    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.DeleteCountries)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Archive(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveCountryCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <summary>Atomically archives up to 100 countries.</summary>
    [HttpPost("bulk-archive")]
    [HasPermission(Permissions.DeleteCountries)]
    [ProducesResponseType(typeof(BulkArchiveCountriesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> BulkArchive(
        [FromBody] BulkArchiveCountriesRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new BulkArchiveCountriesCommand(request.Ids),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Restores one archived country.</summary>
    [HttpPost("{id:int}/restore")]
    [HasPermission(Permissions.DeleteCountries)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Restore(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreCountryCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
