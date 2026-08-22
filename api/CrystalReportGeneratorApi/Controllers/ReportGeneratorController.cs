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

            var paramList = new List<(string PropertyName, string ColumnName)>
                    {
                        (nameof(request.NameAr), "CountryAr"),
                        (nameof(request.NameEn), "CountryEn"),
                    };

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

            var paramList = new List<(string PropertyName, string ColumnName)>
                    {
                        (nameof(request.NameAr), "CountryAr"),
                        (nameof(request.NameEn), "CountryEn"),
                    };

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

        [HttpGet]
        [Route("report/states/generate")]
        //[ApiKeyAuth]
        public HttpResponseMessage GenerateStateReportGet([FromUri] StateReportRequest request)
        {
            var paramList = new List<(string PropertyName, string ColumnName)>
                    {
                        (nameof(request.NameAr), "StateAr"),
                        (nameof(request.NameEn), "StateEn"),
                    };

            return ReportGenerator.GenerateReport(
                request,
                ViewsName.AllStates,
                ViewsQueries.AllStates,
                request.ReportPath,
                request.ReportFileName,
                request.ExportFilename,
                request.LogoName,
                request.Lang,
                paramList);
        }

        [HttpPost]
        [Route("report/states/generate")]
        //[ApiKeyAuth]
        public HttpResponseMessage GenerateStateReportPost([FromBody] StateReportRequest request)
        {
            var paramList = new List<(string PropertyName, string ColumnName)>
                    {
                        (nameof(request.NameAr), "StateAr"),
                        (nameof(request.NameEn), "StateEn"),
                    };

            HttpResponseMessage response = ReportGenerator.GenerateReport(
                request,
                ViewsName.AllStates,
                ViewsQueries.AllStates,
                request.ReportPath,
                request.ReportFileName,
                request.ExportFilename,
                request.LogoName,
                request.Lang,
                paramList);

            response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
            response.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("inline")
            {
                FileName = $"{request.ExportFilename}.pdf"
            };

            return response;
        }
    }
}

