using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.ChangeReportTemplateLifecycle;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.CreateReportTemplate;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.DuplicateReportTemplate;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.UpdateReportTemplate;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportDataSources;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateById;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplateRevisions;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Queries.GetReportTemplates;
using MediatR;

namespace HrManagementSystem.Api.Features.Analytics.ReportTemplates.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/report-templates")]
[ApiController]
[TenantMember]
public sealed class ReportTemplatesController(ISender sender) : ControllerBase
{
    /// <summary>Returns the current tenant's published, active templates for a feature.</summary>
    [HttpGet]
    [HasPermission(Permissions.ViewReportTemplates)]
    [ProducesResponseType(typeof(IReadOnlyList<ReportTemplateListItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublished(
        [FromQuery] string featureKey,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetPublishedReportTemplatesQuery(featureKey), cancellationToken));

    /// <summary>Returns the current tenant's draft, published, and lifecycle-managed templates.</summary>
    [HttpGet("manage")]
    [HasPermission(Permissions.EditReportTemplates)]
    [ProducesResponseType(typeof(IReadOnlyList<ReportTemplateListItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetManagement(
        [FromQuery] string featureKey,
        [FromQuery] string status = "active",
        CancellationToken cancellationToken = default) =>
        Ok(await sender.Send(
            new GetReportTemplatesManagementQuery(featureKey, status),
            cancellationToken));

    /// <summary>Returns one published, active template in the current tenant.</summary>
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.ViewReportTemplates)]
    [ProducesResponseType(typeof(ReportTemplateDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPublishedById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new GetPublishedReportTemplateByIdQuery(id),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Returns one draft, published, or archived template for authoring.</summary>
    [HttpGet("manage/{id:guid}")]
    [HasPermission(Permissions.EditReportTemplates)]
    [ProducesResponseType(typeof(ReportTemplateDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetForManagement(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new GetReportTemplateForManagementQuery(id),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Returns approved environment-neutral data sources for a report feature.</summary>
    [HttpGet("data-sources")]
    [HasPermission(Permissions.ViewReportTemplates)]
    [ProducesResponseType(typeof(IReadOnlyList<ReportDataSourceDescriptorResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDataSources(
        [FromQuery] string featureKey,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetReportDataSourcesQuery(featureKey), cancellationToken));

    /// <summary>Creates an unpublished report template in the current tenant.</summary>
    [HttpPost]
    [HasPermission(Permissions.CreateReportTemplates)]
    [ProducesResponseType(typeof(ReportTemplateDetailResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateReportTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateReportTemplateCommand(
            request.FeatureKey,
            request.Name,
            request.Description,
            request.DataSourceKey,
            request.DefinitionJson);
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetForManagement), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Updates an active report template with optimistic concurrency.</summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.EditReportTemplates)]
    [ProducesResponseType(typeof(ReportTemplateDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateReportTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateReportTemplateCommand(
                id,
                request.Name,
                request.Description,
                request.DataSourceKey,
                request.DefinitionJson,
                request.RowVersion),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Creates an unpublished Save As copy in the current tenant.</summary>
    [HttpPost("{id:guid}/duplicate")]
    [HasPermission(Permissions.CreateReportTemplates)]
    [ProducesResponseType(typeof(ReportTemplateDetailResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Duplicate(
        [FromRoute] Guid id,
        [FromBody] DuplicateReportTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new DuplicateReportTemplateCommand(id, request.Name),
            cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetForManagement), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Publishes an active template after checking its row version.</summary>
    [HttpPost("{id:guid}/publish")]
    [HasPermission(Permissions.PublishReportTemplates)]
    public Task<IActionResult> Publish(
        [FromRoute] Guid id,
        [FromBody] ReportTemplateConcurrencyRequest request,
        CancellationToken cancellationToken) =>
        SendLifecycle(new PublishReportTemplateCommand(id, request.RowVersion), cancellationToken);

    /// <summary>Unpublishes an active template after checking its row version.</summary>
    [HttpPost("{id:guid}/unpublish")]
    [HasPermission(Permissions.PublishReportTemplates)]
    public Task<IActionResult> Unpublish(
        [FromRoute] Guid id,
        [FromBody] ReportTemplateConcurrencyRequest request,
        CancellationToken cancellationToken) =>
        SendLifecycle(new UnpublishReportTemplateCommand(id, request.RowVersion), cancellationToken);

    /// <summary>Soft-archives a template after checking its row version.</summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.DeleteReportTemplates)]
    public Task<IActionResult> Archive(
        [FromRoute] Guid id,
        [FromBody] ReportTemplateConcurrencyRequest request,
        CancellationToken cancellationToken) =>
        SendLifecycle(new ArchiveReportTemplateCommand(id, request.RowVersion), cancellationToken);

    /// <summary>Restores a soft-archived template after checking its row version.</summary>
    [HttpPost("{id:guid}/restore")]
    [HasPermission(Permissions.DeleteReportTemplates)]
    public Task<IActionResult> Restore(
        [FromRoute] Guid id,
        [FromBody] ReportTemplateConcurrencyRequest request,
        CancellationToken cancellationToken) =>
        SendLifecycle(new RestoreReportTemplateCommand(id, request.RowVersion), cancellationToken);

    /// <summary>Returns immutable revisions for one template.</summary>
    [HttpGet("manage/{id:guid}/revisions")]
    [HasPermission(Permissions.EditReportTemplates)]
    public async Task<IActionResult> GetRevisions(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetReportTemplateRevisionsQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Returns one immutable report-template revision.</summary>
    [HttpGet("manage/{id:guid}/revisions/{revisionNumber:int}")]
    [HasPermission(Permissions.EditReportTemplates)]
    public async Task<IActionResult> GetRevision(
        [FromRoute] Guid id,
        [FromRoute] int revisionNumber,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new GetReportTemplateRevisionQuery(id, revisionNumber),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    private async Task<IActionResult> SendLifecycle<TCommand>(
        TCommand command,
        CancellationToken cancellationToken)
        where TCommand : MediatR.IRequest<Result>
    {
        var result = await sender.Send(command, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
