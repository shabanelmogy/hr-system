using System.Web.Http;
using CrystalReportGeneratorApi.Filters;
using System.Web.Http.Dispatcher;

namespace CrystalReportGeneratorApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Never;
            config.Filters.Add(new InternalApiKeyAttribute());
            config.Services.Replace(typeof(IAssembliesResolver), new RuntimeControllerAssemblyResolver());
            config.MessageHandlers.Add(new InternalCorrelationIdHandler());
            config.MapHttpAttributeRoutes();
            SwaggerConfig.Register(config);
        }
    }
}
