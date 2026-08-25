using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.GeographicalInformation.Districts.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[Authorize(Roles = AppRoles.super_admin)]
public sealed class DistrictsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(PageResponse<DistrictListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPage([FromQuery] GetDistrictsQuery query, CancellationToken cancellationToken) =>
        Ok(await sender.Send(query, cancellationToken));

    [HttpGet("lookup")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(IReadOnlyList<DistrictLookupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLookup([FromQuery] int? stateId, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetDistrictLookupQuery(stateId), cancellationToken));

    [HttpGet("by-state/{stateId:int}")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(IReadOnlyList<DistrictLookupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetByState([FromRoute] int stateId, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetDistrictLookupQuery(stateId), cancellationToken));

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(DistrictDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetDistrictByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:int}/addresses")]
    [HasPermission(Permissions.ViewDistricts)]
    [ProducesResponseType(typeof(DistrictWithAddressesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetWithAddresses([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetDistrictWithAddressesQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateDistricts)]
    [ProducesResponseType(typeof(DistrictDetailResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateDistrictCommand command, CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Creates up to 100 Districts atomically under active States.</summary>
    [HttpPost("bulk")]
    [HasPermission(Permissions.CreateDistricts)]
    [ProducesResponseType(typeof(CreateDistrictsResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateBulk(
        [FromBody] CreateDistrictsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateDistrictsCommand(request.Districts),
            cancellationToken);
        return result.IsSuccess
            ? StatusCode(StatusCodes.Status201Created, result.Value)
            : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.EditDistricts)]
    [ProducesResponseType(typeof(DistrictDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateDistrictRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateDistrictCommand(id, request.NameAr, request.NameEn, request.Code, request.StateId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.DeleteDistricts)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Archive([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveDistrictCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("bulk-archive")]
    [HasPermission(Permissions.DeleteDistricts)]
    [ProducesResponseType(typeof(BulkArchiveDistrictsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> BulkArchive([FromBody] BulkArchiveDistrictsRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new BulkArchiveDistrictsCommand(request.Ids), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/restore")]
    [HasPermission(Permissions.DeleteDistricts)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Restore([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreDistrictCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
