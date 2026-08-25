using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Queries;
using MediatR;

namespace HrManagementSystem.Api.Features.GeographicalInformation.AddressTypes.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[TenantMember]
public sealed class AddressTypesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewAddressTypes)]
    [ProducesResponseType(typeof(PageResponse<AddressTypeListItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPage([FromQuery] GetAddressTypesQuery query, CancellationToken cancellationToken) => Ok(await sender.Send(query, cancellationToken));

    [HttpGet("lookup")]
    [HasPermission(Permissions.ViewAddressTypes)]
    [ProducesResponseType(typeof(IReadOnlyList<AddressTypeLookupResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLookup(CancellationToken cancellationToken) => Ok(await sender.Send(new GetAddressTypeLookupQuery(), cancellationToken));

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.ViewAddressTypes)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAddressTypeByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:int}/addresses")]
    [HasPermission(Permissions.ViewAddressTypes)]
    public async Task<IActionResult> GetWithAddresses(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAddressTypeWithAddressesQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.CreateAddressTypes)]
    public async Task<IActionResult> Create([FromBody] CreateAddressTypeCommand command, CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value) : result.ToProblem();
    }

    [HttpPost("bulk")]
    [HasPermission(Permissions.CreateAddressTypes)]
    public async Task<IActionResult> CreateBulk([FromBody] CreateAddressTypesRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateAddressTypesCommand(request.AddressTypes), cancellationToken);
        return result.IsSuccess ? StatusCode(StatusCodes.Status201Created, result.Value) : result.ToProblem();
    }

    [HttpPut("{id:int}")]
    [HasPermission(Permissions.EditAddressTypes)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAddressTypeRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateAddressTypeCommand(id, request.NameAr, request.NameEn), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpDelete("{id:int}")]
    [HasPermission(Permissions.DeleteAddressTypes)]
    public async Task<IActionResult> Archive(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ArchiveAddressTypeCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost("bulk-archive")]
    [HasPermission(Permissions.DeleteAddressTypes)]
    public async Task<IActionResult> BulkArchive([FromBody] BulkArchiveAddressTypesRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new BulkArchiveAddressTypesCommand(request.Ids), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:int}/restore")]
    [HasPermission(Permissions.DeleteAddressTypes)]
    public async Task<IActionResult> Restore(int id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RestoreAddressTypeCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
