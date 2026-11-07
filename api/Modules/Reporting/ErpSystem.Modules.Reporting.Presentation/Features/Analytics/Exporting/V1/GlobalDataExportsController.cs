using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Exporting.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/global-data-exports")]
[ApiController]
[Authorize(Roles = PlatformRoleNames.SuperAdmin)]
[HasPermission(ReportingPermissions.ExportGlobalData)]
[AllowTenantReadOnly]
public sealed class GlobalDataExportsController(ISender sender) : ControllerBase
{
    [HttpPost("{format}/{fileName}/{culture}")]
    [RequestSizeLimit(TabularExportData.MaximumRequestBytes)]
    public async Task<IActionResult> Export(
        string format, string fileName, string culture,
        [FromBody] List<Dictionary<string, object>> data,
        CancellationToken token)
    {
        var file = await sender.Send(new GenerateTabularExportQuery(data, format, fileName, culture), token);
        return File(file.Content, file.ContentType, file.FileName);
    }
}
