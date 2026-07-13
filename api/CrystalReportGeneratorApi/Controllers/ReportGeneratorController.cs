using System.Net.Http;
using System.Web.Http;
using System.Collections.Generic;
using CrystalReportGeneratorApi.Helpers;
using CrystalReportGeneratorApi.ReportRequests;
using CrystalReportGeneratorApi.Filters;

namespace CrystalReportGeneratorApi.Controllers
{
    public class ReportGeneratorController : ApiController
    {
        [HttpGet]
        [Route("report/generate")]
        //[ApiKeyAuth]
        public HttpResponseMessage GenerateReportGet([FromUri] CountryReportRequest request)
        {

            //var paramList = new List<(string PropertyName, string ColumnName)>
            //        {
            //            (nameof(request.NameAr), "NameAr"),
            //            (nameof(request.NameEn), "NameEn"),
            //        };

            var paramList = new List<(string PropertyName, string ColumnName)>();

            return ReportGenerator.GenerateReport(
                request,
                ViewsName.AllCountries,
                ViewsQueries.AllCountries,
                request.ReportPath,
                request.ReportFileName,
                request.ExportFilename,
                request.LogoName,
                request.Lang,
                paramList);
        }


        [HttpPost]
        [Route("report/generate")]
        //[ApiKeyAuth]
        public HttpResponseMessage GenerateReportPost([FromBody] CountryReportRequest request)
        {

            //var paramList = new List<(string PropertyName, string ColumnName)>
            //        {
            //            (nameof(request.NameAr), "NameAr"),
            //            (nameof(request.NameEn), "NameEn"),
            //        };

            var paramList = new List<(string PropertyName, string ColumnName)>();

            // Generate report using the reusable logic
            HttpResponseMessage response = ReportGenerator.GenerateReport(
                request,
                ViewsName.AllCountries,
                ViewsQueries.AllCountries,
                request.ReportPath,
                request.ReportFileName,
                request.ExportFilename,
                request.LogoName,
                request.Lang,
                paramList);

            // Customize headers if needed for PDF
            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            response.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("inline")
            {
                FileName = $"{request.ExportFilename}.pdf"
            };

            return response;
        }
    }
}

