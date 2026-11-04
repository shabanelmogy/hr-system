using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/global-crystal-reports/manage")]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
[HasPermission(ReportingPermissions.ViewGlobalCrystalReports)]
public sealed class GlobalCrystalReportManagementController(ISender sender) : ControllerBase
{
    [HttpGet("entities")]
    public async Task<IActionResult> Entities(CancellationToken token) =>
        Ok(await sender.Send(new GetGlobalCrystalReportEntitiesQuery(), token));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? entityKey, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null, CancellationToken token = default)
    {
        var result = await sender.Send(new GetGlobalCrystalReportManagementQuery(entityKey, search, page, pageSize, status), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("design-sources")]
    public async Task<IActionResult> DesignSources(CancellationToken token) =>
        Ok(await sender.Send(new GetGlobalCrystalReportDesignSourcesQuery(), token));

    [HttpGet("designer-package")]
    [HasPermission(ReportingPermissions.DownloadGlobalCrystalReports)]
    public async Task<IActionResult> DesignerPackage([FromQuery] string sourceKey, CancellationToken token)
    {
        var result = await sender.Send(new DownloadGlobalCrystalReportDesignerPackageQuery(sourceKey), token);
        return result.IsSuccess ? File(result.Value.Content, result.Value.ContentType, result.Value.FileName) : result.ToProblem();
    }

    [HttpGet("database-views")]
    [HasPermission(ReportingPermissions.CreateGlobalCrystalReports)]
    public async Task<IActionResult> DatabaseViews([FromQuery] string sourceKey, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken token = default)
    {
        var result = await sender.Send(new GetGlobalCrystalReportDatabaseViewsQuery(sourceKey, search, page, pageSize), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("drafts")]
    [HasPermission(ReportingPermissions.CreateGlobalCrystalReports)]
    public async Task<IActionResult> CreateDraft([FromBody] CreateGlobalCrystalReportDraftCommand request, CancellationToken token)
    {
        var result = await sender.Send(request, token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Detail(Guid id, CancellationToken token)
    {
        var result = await sender.Send(new GetGlobalCrystalReportDetailQuery(id), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("upload-target")]
    [HasPermission(ReportingPermissions.CreateGlobalCrystalReports)]
    public async Task<IActionResult> UploadTarget([FromQuery] string entityKey, [FromQuery] string fileName, CancellationToken token)
    {
        var result = await sender.Send(new GetGlobalCrystalReportUploadTargetQuery(entityKey, fileName), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("roles")]
    [HasPermission(ReportingPermissions.EditGlobalCrystalReportAccess)]
    public async Task<IActionResult> Roles([FromQuery] string entityKey, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken token = default)
    {
        var result = await sender.Send(new GetGlobalCrystalReportRolesQuery(entityKey, search, page, pageSize), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}/access")]
    public async Task<IActionResult> Access(Guid id, CancellationToken token)
    {
        var result = await sender.Send(new GetGlobalCrystalReportAccessQuery(id), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut("{id:guid}/access")]
    [HasPermission(ReportingPermissions.EditGlobalCrystalReportAccess)]
    public async Task<IActionResult> SaveAccess(Guid id, [FromBody] ReplaceCrystalReportGrantsRequest request, CancellationToken token)
    {
        var result = await sender.Send(new ReplaceGlobalCrystalReportGrantsCommand(id, request.RowVersion, request.Grants.ToArray()), token);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(ReportingPermissions.ArchiveGlobalCrystalReports)]
    public async Task<IActionResult> Archive(Guid id, [FromBody] CrystalReportConcurrencyRequest request, CancellationToken token)
    {
        var result = await sender.Send(new ArchiveGlobalCrystalReportCommand(id, request.RowVersion), token);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet("schema")]
    [HasPermission(ReportingPermissions.DownloadGlobalCrystalReports)]
    public async Task<IActionResult> Schema([FromQuery] string entityKey, CancellationToken token)
    {
        var result = await sender.Send(new DownloadGlobalCrystalReportSchemaQuery(entityKey), token);
        return result.IsSuccess ? File(result.Value.Content, result.Value.ContentType, result.Value.FileName) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(ReportingPermissions.CreateGlobalCrystalReports)]
    [TypeFilter(typeof(CrystalReportUploadRequestSizeFilter))]
    public async Task<IActionResult> Create([FromForm] CreateCrystalReportForm form, CancellationToken token)
    {
        var result = await sender.Send(new CreateGlobalCrystalReportCommand(form.EntityKey, form.Description, Upload(form.File)), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:guid}/versions")]
    [HasPermission(ReportingPermissions.UploadGlobalCrystalReports)]
    [TypeFilter(typeof(CrystalReportUploadRequestSizeFilter))]
    public async Task<IActionResult> UploadVersion(Guid id, [FromForm] CrystalReportFileForm form, CancellationToken token)
    {
        var result = await sender.Send(new UploadGlobalCrystalReportVersionCommand(id, Upload(form.File)), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:guid}/replace")]
    [HasPermission(ReportingPermissions.UploadGlobalCrystalReports)]
    [HasPermission(ReportingPermissions.PublishGlobalCrystalReports)]
    [TypeFilter(typeof(CrystalReportUploadRequestSizeFilter))]
    public async Task<IActionResult> Replace(Guid id, [FromForm] CrystalReportFileForm form,
        [FromForm] string rowVersion, CancellationToken token)
    {
        var result = await sender.Send(new ReplaceGlobalCrystalReportCommand(id, rowVersion, Upload(form.File)), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("inspect")]
    [HasPermission(ReportingPermissions.UploadGlobalCrystalReports)]
    [TypeFilter(typeof(CrystalReportUploadRequestSizeFilter))]
    public async Task<IActionResult> Inspect([FromForm] CreateCrystalReportForm form, CancellationToken token)
    {
        var result = await sender.Send(new InspectGlobalCrystalReportCommand(form.EntityKey, Upload(form.File)), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:guid}/versions/{versionId:guid}/publish")]
    [HasPermission(ReportingPermissions.PublishGlobalCrystalReports)]
    public async Task<IActionResult> Publish(Guid id, Guid versionId, [FromBody] CrystalReportConcurrencyRequest request, CancellationToken token)
    {
        var result = await sender.Send(new PublishGlobalCrystalReportVersionCommand(id, versionId, request.RowVersion), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("{id:guid}/versions/{versionId:guid}/revalidate")]
    [HasPermission(ReportingPermissions.UploadGlobalCrystalReports)]
    public async Task<IActionResult> Revalidate(Guid id, Guid versionId, CancellationToken token)
    {
        var result = await sender.Send(new RevalidateGlobalCrystalReportVersionCommand(id, versionId), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id:guid}/versions/{versionId:guid}/source")]
    [HasPermission(ReportingPermissions.DownloadGlobalCrystalReports)]
    public async Task<IActionResult> Download(Guid id, Guid versionId, CancellationToken token)
    {
        var result = await sender.Send(new DownloadGlobalCrystalReportVersionQuery(id, versionId), token);
        return result.IsSuccess ? File(result.Value.Content, result.Value.ContentType, result.Value.FileName) : result.ToProblem();
    }

    [HttpGet("deployment-candidates")]
    [HasPermission(ReportingPermissions.CreateGlobalCrystalReports)]
    public async Task<IActionResult> Candidates([FromQuery] string entityKey, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken token = default)
    {
        var result = await sender.Send(new GetGlobalCrystalReportCandidatesQuery(entityKey, search, page, pageSize), token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("import")]
    [HasPermission(ReportingPermissions.CreateGlobalCrystalReports)]
    public async Task<IActionResult> Import([FromBody] ImportGlobalCrystalReportCommand request, CancellationToken token)
    {
        var result = await sender.Send(request, token);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    private static FileUpload Upload(IFormFile file) =>
        new(file.FileName, file.ContentType, file.Length, file.OpenReadStream);
}
