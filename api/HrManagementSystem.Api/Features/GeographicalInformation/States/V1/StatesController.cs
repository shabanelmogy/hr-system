using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.GeographicalInformation.States.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[TenantMember]
public sealed class StatesController(ISender sender) : ControllerBase
{
    /// <summary>Returns a server-paged State collection with parent-country and lifecycle filtering.</summary>
    [HttpGet]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(PageResponse<StateListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPage([FromQuery] GetStatesQuery query, CancellationToken cancellationToken) =>
        Ok(await sender.Send(query, cancellationToken));

    /// <summary>Returns lightweight active States, optionally for one active country.</summary>
    [HttpGet("lookup")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(IReadOnlyList<StateLookupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLookup([FromQuery] int? countryId, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetStateLookupQuery(countryId), cancellationToken));

    /// <summary>Compatibility lookup for dependent District selectors.</summary>
    [HttpGet("by-country/{countryId:int}")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(IReadOnlyList<StateLookupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByCountry([FromRoute] int countryId, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetStateLookupQuery(countryId), cancellationToken));

    /// <summary>Returns one State, including an archived State, with its parent country.</summary>
    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(StateDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetStateByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Returns one State with its active Districts.</summary>
    [HttpGet("{id:int}/districts")]
    [HasPermission(Permissions.ViewStates)]
    [ProducesResponseType(typeof(StateWithDistrictsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetWithDistricts([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetStateWithDistrictsQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Creates one State under an active country.</summary>
    [HttpPost]
    [HasPermission(Permissions.CreateStates)]
    [ProducesResponseType(typeof(StateDetailResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateStateCommand command, CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Creates up to 100 states atomically under active countries.</summary>
    [HttpPost("bulk")]
    [HasPermission(Permissions.CreateStates)]
    [ProducesResponseType(typeof(CreateStatesResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateBulk(
        [FromBody] CreateStatesRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateStatesCommand(request.States),
            cancellationToken);
        return result.IsSuccess
            ? StatusCode(StatusCodes.Status201Created, result.Value)
            : result.ToProblem();
    }

    /// <summary>Updates one active State.</summary>
    [HttpPut("{id:int}")]
    [HasPermission(Permissions.EditStates)]
    [ProducesResponseType(typeof(StateDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateStateRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateStateCommand(id, request.NameAr, request.NameEn, request.Code, request.CountryId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Archives one State when it has no active Districts.</summary>
    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.DeleteStates)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Archive([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveStateCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    /// <summary>Atomically archives up to 100 States.</summary>
    [HttpPost("bulk-archive")]
    [HasPermission(Permissions.DeleteStates)]
    [ProducesResponseType(typeof(BulkArchiveStatesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> BulkArchive([FromBody] BulkArchiveStatesRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new BulkArchiveStatesCommand(request.Ids), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Restores one archived State when its parent country is active.</summary>
    [HttpPost("{id:int}/restore")]
    [HasPermission(Permissions.DeleteStates)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Restore([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreStateCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
