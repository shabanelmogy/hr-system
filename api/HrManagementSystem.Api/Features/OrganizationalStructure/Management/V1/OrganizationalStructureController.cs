using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Commands;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Queries;
using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Contracts;
using MediatR;

namespace HrManagementSystem.Api.Features.OrganizationalStructure.Management.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/organizational-structure/{resource}")]
[ApiController]
[TenantMember]
public sealed class OrganizationalStructureController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewOrganizationalStructure)]
    [ProducesResponseType(typeof(PageResponse<OrganizationalStructureItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage(
        [FromRoute] string resource,
        [FromQuery] GetOrganizationalStructureQuery query,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(query with { Resource = resource }, cancellationToken));

    [HttpGet("lookup")]
    [HasPermission(Permissions.ViewOrganizationalStructure)]
    [ProducesResponseType(typeof(IReadOnlyList<OrganizationalStructureLookup>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLookup(
        [FromRoute] string resource,
        [FromQuery] int? parentId,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetOrganizationalStructureLookupQuery(resource, parentId), cancellationToken));

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewOrganizationalStructure)]
    [ProducesResponseType(typeof(OrganizationalStructureItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string resource, int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetOrganizationalStructureItemQuery(resource, id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:int}/change-logs")]
    [HasPermission(Permissions.ViewOrganizationalStructure)]
    [ProducesResponseType(typeof(IReadOnlyList<EntityChangeLogsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetChangeLogs(
        [FromRoute] string resource,
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetOrganizationalStructureChangeLogsQuery(resource, id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateOrganizationalStructure)]
    [ProducesResponseType(typeof(OrganizationalStructureItem), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        string resource,
        [FromBody] OrganizationalStructureMutation request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateOrganizationalStructureCommand(resource, request), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { resource, id = result.Value.Id, version = "1.0" }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Creates up to 100 organizational items atomically.</summary>
    [HttpPost("bulk")]
    [HasPermission(Permissions.CreateOrganizationalStructure)]
    [ProducesResponseType(typeof(OrganizationalStructureBulkCreateResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateBulk(
        string resource,
        [FromBody] OrganizationalStructureBulkCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateOrganizationalStructureBulkCommand(resource, request.Items), cancellationToken);
        return result.IsSuccess ? StatusCode(StatusCodes.Status201Created, result.Value) : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.EditOrganizationalStructure)]
    [ProducesResponseType(typeof(OrganizationalStructureItem), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        string resource,
        int id,
        [FromBody] OrganizationalStructureMutation request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateOrganizationalStructureCommand(resource, id, request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.DeleteOrganizationalStructure)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Archive(string resource, int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveOrganizationalStructureCommand(resource, id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("{id:int}/restore")]
    [HasPermission(Permissions.DeleteOrganizationalStructure)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Restore(string resource, int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreOrganizationalStructureCommand(resource, id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("{id:int}/approve")]
    [HasPermission(Permissions.ApproveJobDescriptions)]
    [ProducesResponseType(typeof(OrganizationalStructureItem), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(
        string resource,
        int id,
        [FromBody] ApproveJobDescriptionRequest request,
        CancellationToken cancellationToken)
    {
        if (!resource.Equals("job-descriptions", StringComparison.OrdinalIgnoreCase))
            return NotFound();
        var result = await sender.Send(
            new ApproveJobDescriptionCommand(id, request.EffectiveDate, request.ExpiryDate), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/reject")]
    [HasPermission(Permissions.ApproveJobDescriptions)]
    [ProducesResponseType(typeof(OrganizationalStructureItem), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(
        string resource,
        int id,
        [FromBody] RejectJobDescriptionRequest request,
        CancellationToken cancellationToken)
    {
        if (!resource.Equals("job-descriptions", StringComparison.OrdinalIgnoreCase))
            return NotFound();
        var result = await sender.Send(new RejectJobDescriptionCommand(id, request.Reason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
