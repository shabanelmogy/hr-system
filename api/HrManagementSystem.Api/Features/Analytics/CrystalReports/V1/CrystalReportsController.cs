using HrManagementSystem.Application.Features.Analytics.CrystalReports.Commands;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Queries;
using HrManagementSystem.Application.Common.Files;
using MediatR;

namespace HrManagementSystem.Api.Features.Analytics.CrystalReports.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/crystal-reports")]
[ApiController]
[TenantMember]
public sealed class CrystalReportsController(ISender sender) : ControllerBase
{
    /// <summary>Lists published reports the current user's roles may run in the current company.</summary>
    [HttpGet]
    [HasPermission(Permissions.ViewCrystalReports)]
    public async Task<IActionResult> GetPublished(
        [FromQuery] string? entityKey,
        [FromQuery] string? search,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetPublishedCrystalReportsQuery(entityKey, search), cancellationToken));

    /// <summary>Renders the current published version after enforcing the report Run ACL.</summary>
    [HttpPost("{id:guid}/render")]
    [HasPermission(Permissions.ViewCrystalReports)]
    public async Task<IActionResult> Render(
        Guid id,
        [FromBody] CrystalReportRenderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RenderCrystalReportQuery(
            id, request.Language, request.Filters), cancellationToken);
        return result.IsSuccess
            ? File(result.Value.Content, result.Value.ContentType, enableRangeProcessing: false)
            : result.ToProblem();
    }

    /// <summary>Lists reports for tenant management; archived rows are opt-in.</summary>
    [HttpGet("manage")]
    [HasPermission(Permissions.ManageCrystalReportAccess)]
    public async Task<IActionResult> GetManagement(
        [FromQuery] string? entityKey,
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default) =>
        Ok(await sender.Send(
            new GetCrystalReportsManagementQuery(entityKey, search, status, page, pageSize),
            cancellationToken));

    [HttpGet("manage/{id:guid}")]
    [HasPermission(Permissions.ManageCrystalReportAccess)]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCrystalReportDetailQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Lists approved legacy RPT files that can be imported into the current tenant.</summary>
    [HttpGet("legacy-candidates")]
    [HasPermission(Permissions.ManageCrystalReportAccess)]
    public async Task<IActionResult> GetLegacyCandidates(
        [FromQuery] string? entityKey,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new GetDiscoveredCrystalReportsQuery(entityKey), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Copies one approved legacy RPT into tenant-owned immutable storage as draft version 1.</summary>
    [HttpPost("legacy-imports")]
    [HasPermission(Permissions.CreateCrystalReports)]
    public async Task<IActionResult> ImportLegacy(
        [FromBody] ImportDiscoveredCrystalReportRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ImportDiscoveredCrystalReportCommand(
            request.SourceId, request.ExpectedSha256, request.Description), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetDetail), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Creates a logical report and immutable version 1 after legacy Crystal inspection.</summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [HasPermission(Permissions.CreateCrystalReports)]
    public async Task<IActionResult> Create(
        [FromForm] CreateCrystalReportForm form,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateCrystalReportCommand(
            form.EntityKey, form.Description, ToUpload(form.File)), cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetDetail), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }

    /// <summary>Adds an immutable draft version; it never overwrites an existing RPT.</summary>
    [HttpPost("{id:guid}/versions")]
    [Consumes("multipart/form-data")]
    [HasPermission(Permissions.UploadCrystalReports)]
    public async Task<IActionResult> AddVersion(
        Guid id,
        [FromForm] CrystalReportFileForm form,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new AddCrystalReportVersionCommand(id, ToUpload(form.File)), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}/versions")]
    [HasPermission(Permissions.ManageCrystalReportAccess)]
    public async Task<IActionResult> GetVersions(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCrystalReportVersionsQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}/download")]
    [HasPermission(Permissions.DownloadCrystalReports)]
    public Task<IActionResult> DownloadPublished(Guid id, CancellationToken cancellationToken) =>
        Download(new DownloadCrystalReportQuery(id, null), cancellationToken);

    [HttpGet("{id:guid}/versions/{versionId:guid}/download")]
    [HasPermission(Permissions.DownloadCrystalReports)]
    public Task<IActionResult> DownloadVersion(
        Guid id, Guid versionId, CancellationToken cancellationToken) =>
        Download(new DownloadCrystalReportQuery(id, versionId), cancellationToken);

    [HttpPost("{id:guid}/versions/{versionId:guid}/publish")]
    [HasPermission(Permissions.PublishCrystalReports)]
    public async Task<IActionResult> Publish(
        Guid id,
        Guid versionId,
        [FromBody] CrystalReportConcurrencyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new PublishCrystalReportVersionCommand(id, versionId, request.RowVersion),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}/access")]
    [HasPermission(Permissions.ManageCrystalReportAccess)]
    public async Task<IActionResult> GetGrants(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCrystalReportGrantsQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Atomically replaces current-company role grants; no tenant/company comes from the client.</summary>
    [HttpPut("{id:guid}/access")]
    [HasPermission(Permissions.ManageCrystalReportAccess)]
    public async Task<IActionResult> ReplaceGrants(
        Guid id,
        [FromBody] ReplaceCrystalReportGrantsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new ReplaceCrystalReportGrantsCommand(id, request.RowVersion, request.Grants),
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    /// <summary>Soft-archives the logical report; immutable source versions remain private.</summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.DeleteCrystalReports)]
    public async Task<IActionResult> Archive(
        Guid id,
        [FromBody] CrystalReportConcurrencyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new ArchiveCrystalReportCommand(id, request.RowVersion), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    private async Task<IActionResult> Download(
        DownloadCrystalReportQuery query, CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
        return result.IsSuccess
            ? File(result.Value.Content, result.Value.ContentType,
                result.Value.FileName, enableRangeProcessing: true)
            : result.ToProblem();
    }

    private static FileUpload ToUpload(IFormFile file) =>
        new(file.FileName, file.ContentType, file.Length, file.OpenReadStream);
}

public sealed class CreateCrystalReportForm
{
    public string EntityKey { get; init; } = string.Empty;
    public string? Description { get; init; }
    public IFormFile File { get; init; } = default!;
}

public sealed class CrystalReportFileForm
{
    public IFormFile File { get; init; } = default!;
}
