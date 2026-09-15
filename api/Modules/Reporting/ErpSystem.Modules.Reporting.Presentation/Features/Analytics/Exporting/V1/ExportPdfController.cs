using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;
using ErpSystem.Modules.Reporting.Contracts.Authorization;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Exporting.V1
{
    [ApiVersion("1.0")]
    [Route(ApiRoutes.BaseRoute)]
    [ApiController]
    [TenantMember]
    [AllowTenantReadOnly]
    public class ExportPdfController(ISender sender) : ControllerBase
    {
        // Endpoint to generate and download a PDF
        [HttpPost("{fileName}/{reportHead}/{culture}")]
        [HasPermission(ReportingPermissions.ExportData)]
        public async Task<IActionResult> GenerateSyncfusionPdf(
            [FromBody] List<Dictionary<string, object>> Forecasts,
            string fileName,
            string reportHead,
            string culture,
            CancellationToken cancellationToken)
        {
            if (Forecasts == null || Forecasts.Count == 0)
            {
                return BadRequest("Forecast data cannot be null or empty.");
            }

            var export = await sender.Send(
                new GeneratePdfExportQuery(Forecasts, fileName, reportHead, culture),
                cancellationToken);
            return File(export.Content, "application/pdf", export.DownloadFileName);
        }
    }
}
