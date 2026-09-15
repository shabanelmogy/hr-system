using CrystalReportGeneratorApi.Filters;
using CrystalReportGeneratorApi.Runtime;
using CrystalReportGeneratorApi.Runtime.Catalog;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace CrystalReportGeneratorApi.Controllers
{
    /// <summary>
    /// Internal discovery and source-download boundary for deployment-owned reports.
    /// Client-provided filesystem paths are deliberately unsupported.
    /// </summary>
    [InternalApiKey]
    public sealed class InternalReportCatalogController : ApiController
    {
        private readonly CrystalReportCatalogService _catalogService =
            new CrystalReportCatalogService();

        [HttpGet]
        [Route("internal/reports/catalog")]
        public IHttpActionResult List([FromUri] string entityKey = null)
        {
            try
            {
                var entries = _catalogService.List(entityKey);
                CrystalRuntimeDiagnostics.Information(Request, "catalog-list", "success");
                return Ok(entries);
            }
            catch (CrystalReportCatalogValidationException exception)
            {
                CrystalRuntimeDiagnostics.Warning(Request, "catalog-list", InternalReportErrorCodes.InvalidRequest, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.BadRequest,
                    InternalReportErrorCodes.InvalidRequest,
                    exception.Message));
            }
            catch (CrystalReportCatalogNotFoundException)
            {
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.NotFound,
                    InternalReportErrorCodes.CatalogNotFound,
                    "The report catalog entry was not found."));
            }
            catch (CrystalReportCatalogConflictException exception)
            {
                CrystalRuntimeDiagnostics.Warning(Request, "catalog-list", InternalReportErrorCodes.CatalogConflict, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.Conflict,
                    InternalReportErrorCodes.CatalogConflict,
                    exception.Message));
            }
            catch (CrystalReportCatalogUnavailableException exception)
            {
                CrystalRuntimeDiagnostics.Error(Request, "catalog-list", InternalReportErrorCodes.CatalogUnavailable, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.ServiceUnavailable,
                    InternalReportErrorCodes.CatalogUnavailable,
                    exception.Message));
            }
            catch (Exception exception)
            {
                CrystalRuntimeDiagnostics.Error(Request, "catalog-list", InternalReportErrorCodes.CatalogUnavailable, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.ServiceUnavailable,
                    InternalReportErrorCodes.CatalogUnavailable,
                    "The report catalog could not be read."));
            }
        }

        [HttpGet]
        [Route("internal/reports/catalog/{sourceId}/source")]
        public IHttpActionResult DownloadSource(
            string sourceId,
            [FromUri] string expectedSha256)
        {
            try
            {
                var source = _catalogService.OpenSource(sourceId, expectedSha256);
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StreamContent(source.Content);
                response.Content.Headers.ContentType =
                    new MediaTypeHeaderValue("application/octet-stream");
                response.Content.Headers.ContentLength = source.Content.Length;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = "\"" + source.Entry.FileName.Replace("\"", string.Empty) + "\""
                };
                response.Headers.CacheControl = new CacheControlHeaderValue
                {
                    NoCache = true,
                    NoStore = true,
                    MustRevalidate = true
                };
                CrystalRuntimeDiagnostics.Information(Request, "catalog-source", "success");
                return ResponseMessage(response);
            }
            catch (CrystalReportCatalogValidationException exception)
            {
                CrystalRuntimeDiagnostics.Warning(Request, "catalog-source", InternalReportErrorCodes.InvalidRequest, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.BadRequest,
                    InternalReportErrorCodes.InvalidRequest,
                    exception.Message));
            }
            catch (CrystalReportCatalogNotFoundException)
            {
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.NotFound,
                    InternalReportErrorCodes.CatalogNotFound,
                    "The report source was not found."));
            }
            catch (CrystalReportCatalogConflictException exception)
            {
                CrystalRuntimeDiagnostics.Warning(Request, "catalog-source", InternalReportErrorCodes.CatalogConflict, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.Conflict,
                    InternalReportErrorCodes.CatalogConflict,
                    exception.Message));
            }
            catch (CrystalReportCatalogUnavailableException exception)
            {
                CrystalRuntimeDiagnostics.Error(Request, "catalog-source", InternalReportErrorCodes.CatalogUnavailable, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.ServiceUnavailable,
                    InternalReportErrorCodes.CatalogUnavailable,
                    exception.Message));
            }
            catch (Exception exception)
            {
                CrystalRuntimeDiagnostics.Error(Request, "catalog-source", InternalReportErrorCodes.CatalogUnavailable, exception);
                return ResponseMessage(InternalReportResponseFactory.Create(
                    Request,
                    HttpStatusCode.ServiceUnavailable,
                    InternalReportErrorCodes.CatalogUnavailable,
                    "The report source could not be read."));
            }
        }
    }
}
