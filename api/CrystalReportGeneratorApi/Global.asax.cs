using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using CrystalReportGeneratorApi.Services;

namespace CrystalReportGeneratorApi
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            try
            {
                // Initialize database tables
                var tableService = new DatabaseService();
            }
            catch
            {
            }
        }
    }
}
