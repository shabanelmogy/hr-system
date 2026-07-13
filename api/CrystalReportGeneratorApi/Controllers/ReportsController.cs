using System;
using System.Web.Http;
using CrystalReportGeneratorApi.Helpers;
using CrystalReportGeneratorApi.ReportRequests;

namespace CrystalReportGeneratorApi.Controllers
{
    public class ReportsController : ApiController
    {

        [HttpPost]
        [Route("report/info")]
        public IHttpActionResult GetReportTitlesByCategory([FromBody] ReportTitlesRequest request)
        {
            try
            {
                // Combine the root path with subfolder
                string virtualFolderPath = $"~/Reports/{request.SubFolderPath}";
                var titles = CrystalReportFacade.GetReportTitlesInFolder(virtualFolderPath, request.ReportCategory);
                return Ok(titles);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}