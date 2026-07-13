using HrManagementSystem.Features.Analytics.Exporting.Services;

namespace HrManagementSystem.Features.Analytics.Exporting.Controllers.V1
{
    [ApiVersion("1.0")]
    [Route(ApiRoutes.BaseRoute)]
    [ApiController]
    public class ExportPdfController(IExportPdfFileService pdfService) : ControllerBase
    {
        private readonly IExportPdfFileService _pdfService = pdfService;

        // Endpoint to generate and download a PDF
        [HttpPost("{fileName}/{reportHead}/{culture}")]
        public IActionResult GenerateSyncfusionPdf([FromBody] List<Dictionary<string, object>> Forecasts, string fileName, string reportHead, string culture)
        {
            if (Forecasts == null || Forecasts.Count == 0)
            {
                return BadRequest("Forecast data cannot be null or empty.");
            }

            try
            {
                // Generate the PDF as a byte array
                var pdfBytes = _pdfService.CreatePDF(Forecasts, fileName, reportHead, culture);

                // Return the PDF as a filea
                return File(pdfBytes, "application/pdf", $"{fileName}_{DateTime.Now:yyyy-MM-dd}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}