using System.Web;
using System.Web.Http;
using CrystalReportGeneratorApi.Runtime;
using System;

namespace CrystalReportGeneratorApi
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            CrystalReportRuntimeSettings.Validate();
            CrystalReportExecutionGate.ValidateConfiguration();
            CrystalReportRequestWorkspace.ScavengeStaleDirectories(TimeSpan.FromHours(6));
            CrystalRuntimeDiagnostics.Initialize();
            GlobalConfiguration.Configure(WebApiConfig.Register);
        }

        protected void Application_BeginRequest()
        {
            if (!string.Equals(
                    Request.AppRelativeCurrentExecutionFilePath,
                    "~/",
                    StringComparison.Ordinal) ||
                !string.IsNullOrEmpty(Request.PathInfo))
                return;

            Response.Redirect(VirtualPathUtility.ToAbsolute("~/swagger"), false);
            CompleteRequest();
        }
    }
}
