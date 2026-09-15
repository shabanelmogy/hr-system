using CrystalDecisions.CrystalReports.Engine;
using CrystalReportGeneratorApi.Filters;
using CrystalReportGeneratorApi.Runtime;
using CrystalReportGeneratorApi.Runtime.Rendering;
using System;
using System.IO;
using System.Net;
using System.Web.Http;

namespace CrystalReportGeneratorApi.Controllers
{
    [InternalApiKey]
    public sealed class InternalReportHealthController : ApiController
    {
        [HttpGet]
        [Route("internal/reports/health")]
        public IHttpActionResult Get()
        {
            var probePath = Path.Combine(
                Path.GetTempPath(),
                "erpsystem-crystal-health-" + Guid.NewGuid().ToString("N") + ".tmp");

            try
            {
                CrystalReportRuntimeSettings.Validate();
                CrystalReportExecutionGate.ValidateConfiguration();

                // Do not construct ReportDocument here. SAP Crystal initialization can block
                // inside native code; a readiness endpoint must remain bounded and deterministic.
                var engineAssembly = typeof(ReportDocument).Assembly;
                if (engineAssembly == null ||
                    string.IsNullOrWhiteSpace(engineAssembly.Location) ||
                    !File.Exists(engineAssembly.Location))
                    throw new InvalidOperationException("The Crystal Reports engine assembly is unavailable.");

                using (File.Create(probePath))
                {
                    // Rendering depends on a writable host temp location.
                }

                return Ok(new
                {
                    status = "Healthy",
                    engineAssemblyVersion = engineAssembly.GetName().Version.ToString(),
                    profileCount = CrystalReportProfileRegistry.CreateDefault().Count
                });
            }
            catch (Exception exception)
            {
                CrystalRuntimeDiagnostics.Error(Request, "health", "crystal_runtime_not_ready", exception);
                return Content(
                    HttpStatusCode.ServiceUnavailable,
                    new { status = "Unhealthy", detail = "The Crystal report runtime is not ready." });
            }
            finally
            {
                try
                {
                    if (File.Exists(probePath))
                        File.Delete(probePath);
                }
                catch
                {
                    // Best-effort health probe cleanup.
                }
            }
        }
    }
}
