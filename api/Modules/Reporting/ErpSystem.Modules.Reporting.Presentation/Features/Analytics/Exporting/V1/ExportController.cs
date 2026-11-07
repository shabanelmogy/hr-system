using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;
using ErpSystem.Modules.Reporting.Contracts.Authorization;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Exporting.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
[TenantMember]
[AllowTenantReadOnly]
public class ExportController(ISender sender) : ControllerBase
{
    [HttpPost("{fileName}/{culture:alpha}")]
    [RequestSizeLimit(TabularExportData.MaximumRequestBytes)]
    [HasPermission(ReportingPermissions.ExportData)]
    public async Task<IActionResult> ExportExcel(
        [FromBody] List<Dictionary<string, object>> data,
        string fileName,
        string culture,
        CancellationToken cancellationToken)
    {
        var file = await sender.Send(new GenerateTabularExportQuery(data, "xlsx", fileName, culture), cancellationToken);
        return File(file.Content, file.ContentType, file.FileName);
    }

    [HttpPost("{fileName}/{culture}")]
    [RequestSizeLimit(TabularExportData.MaximumRequestBytes)]
    [HasPermission(ReportingPermissions.ExportData)]
    public async Task<IActionResult> ExportCsv(
        [FromBody] List<Dictionary<string, object>> data,
        string fileName,
        string culture,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            fileName = "export.csv";
        }

        var file = await sender.Send(new GenerateTabularExportQuery(data, "csv", fileName, culture), cancellationToken);
        return File(file.Content, file.ContentType, file.FileName);
    }


}
