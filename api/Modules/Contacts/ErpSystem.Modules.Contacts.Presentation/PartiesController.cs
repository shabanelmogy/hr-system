using ErpSystem.Modules.Contacts.Application.Parties;
using ErpSystem.BuildingBlocks.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Contacts.Presentation;

[ApiController]
[Authorize]
[TenantMember]
[Route("api/v1/contacts/parties")]
public sealed class PartiesController(ISender sender) : ControllerBase
{
    [HttpGet("{id:guid}")]
    [HasPermission(PartyPermissions.View)]
    public async Task<ActionResult<PartyResponse>> Get(Guid id, CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetPartyQuery(id), cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }

    [HttpPost]
    [HasPermission(PartyPermissions.Create)]
    public async Task<ActionResult<PartyResponse>> Create(
        CreatePartyRequest request,
        CancellationToken cancellationToken)
    {
        var response = await sender.Send(
            new CreatePartyCommand(
                request.DisplayName,
                request.Email,
                request.Phone,
                HttpContext.TraceIdentifier),
            cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [HasPermission(PartyPermissions.Edit)]
    public async Task<ActionResult<PartyResponse>> Update(
        Guid id,
        UpdatePartyRequest request,
        CancellationToken cancellationToken)
    {
        var response = await sender.Send(
            new UpdatePartyCommand(
                id,
                request.DisplayName,
                request.Email,
                request.Phone,
                request.ExpectedRevision,
                HttpContext.TraceIdentifier),
            cancellationToken);

        return response is null ? NotFound() : Ok(response);
    }
}

public sealed record CreatePartyRequest(string DisplayName, string? Email, string? Phone);

public sealed record UpdatePartyRequest(
    string DisplayName,
    string? Email,
    string? Phone,
    long ExpectedRevision);
