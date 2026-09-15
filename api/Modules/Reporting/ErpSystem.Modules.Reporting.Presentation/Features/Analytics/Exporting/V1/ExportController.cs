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
    [HasPermission(ReportingPermissions.ExportData)]
    public async Task<IActionResult> ExportExcel(
        [FromBody] List<Dictionary<string, object>> data,
        string fileName,
        string culture,
        CancellationToken cancellationToken)
    {
        var fileContent = await sender.Send(new GenerateExcelExportQuery(data, culture), cancellationToken);

        return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpPost("{fileName}/{culture}")]
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

        var csvBytes = await sender.Send(new GenerateCsvExportQuery(data), cancellationToken);
        return File(csvBytes, "text/csv", fileName);
    }


}
