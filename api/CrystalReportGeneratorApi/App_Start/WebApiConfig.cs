using System.Web.Http;
using CrystalReportGeneratorApi.Filters;

namespace CrystalReportGeneratorApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Never;
            config.MessageHandlers.Add(new InternalCorrelationIdHandler());
            config.MapHttpAttributeRoutes();
            SwaggerConfig.Register(config);
        }
    }
}
