using System.Web.Http;
using System.Web.Http.Description;
using Swashbuckle.Application;
using Swashbuckle.Swagger;

namespace CrystalReportGeneratorApi
{
    internal static class SwaggerConfig
    {
        internal static void Register(HttpConfiguration config)
        {
            config
                .EnableSwagger(c =>
                {
                    c.SingleApiVersion("v1", "Crystal Report Runtime API");
                    c.PrettyPrint();
                    c.OperationFilter<InternalApiKeyHeaderOperationFilter>();
                })
                .EnableSwaggerUi(c =>
                {
                    c.DocumentTitle("Crystal Report Runtime API");
                    c.DocExpansion(DocExpansion.List);
                });
        }
    }

    internal sealed class InternalApiKeyHeaderOperationFilter : IOperationFilter
    {
        private const string DevelopmentApiKey = "dev-crystal-report-key";

        public void Apply(Operation operation, SchemaRegistry schemaRegistry, ApiDescription apiDescription)
        {
            if (operation.parameters == null)
                operation.parameters = new System.Collections.Generic.List<Parameter>();

            operation.parameters.Add(new Parameter
            {
                name = "X-Internal-Api-Key",
                @in = "header",
                type = "string",
                required = true,
                @default = DevelopmentApiKey,
                description = "Development internal API key"
            });
        }
    }
}
