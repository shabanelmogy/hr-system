namespace HrManagementSystem.Features.Analytics.Exporting.Controllers.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
public class ExportController(IExportExcelService excelService) : ControllerBase
{
    private readonly IExportExcelService _excelService = excelService;

    [HttpPost("{fileName}/{culture:alpha}")]
    public IActionResult ExportExcel([FromBody] List<Dictionary<string, object>> data, string fileName, string culture)
    {
        var fileContent = _excelService.ExportToExcelBytes(data, "Sheet1", culture);

        return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpPost("{fileName}/{culture}")]
    public IActionResult ExportCsv([FromBody] List<Dictionary<string, object>> data, string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            fileName = "export.csv";
        }

        try
        {
            var csvBytes = _excelService.ExportToCsvBytes(data);
            return File(csvBytes, "text/csv", fileName);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while processing the request.", Details = ex.Message });
        }
    }


}
