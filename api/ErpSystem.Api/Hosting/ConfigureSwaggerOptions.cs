using Asp.Versioning.ApiExplorer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ErpSystem.Api.Hosting;

public sealed class ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
    : IConfigureOptions<SwaggerGenOptions>
{
    public void Configure(SwaggerGenOptions options)
    {
        foreach (var description in provider.ApiVersionDescriptions)
            options.SwaggerDoc(description.GroupName, CreateVersionInfo(description));

        foreach (var xmlPath in Directory.EnumerateFiles(
                     AppContext.BaseDirectory,
                     "ErpSystem*.xml",
                     SearchOption.TopDirectoryOnly))
        {
            options.IncludeXmlComments(xmlPath);
        }

        options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
        {
            Description = "Enter a valid JWT token.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            BearerFormat = "JWT",
            Scheme = JwtBearerDefaults.AuthenticationScheme
        });

        options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document, null),
                []
            }
        });
    }

    private static OpenApiInfo CreateVersionInfo(ApiVersionDescription description) =>
        new()
        {
            Title = "ERP System API",
            Version = description.ApiVersion.ToString(),
            Description = description.IsDeprecated
                ? "This API version has been deprecated."
                : "API for the ERP System."
        };
}
