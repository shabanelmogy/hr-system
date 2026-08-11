namespace HrManagementSystem.Infrastructure.Versions;

public class ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider) : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider = provider;

    public void Configure(SwaggerGenOptions options)
    {
        foreach (var description in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(description.GroupName, CreateVersioninfo(description));
        }

        foreach (var xmlPath in Directory.EnumerateFiles(
                     AppContext.BaseDirectory,
                     "HrManagementSystem*.xml",
                     SearchOption.TopDirectoryOnly))
        {
            options.IncludeXmlComments(xmlPath);
        }

        AddSecurity(options);
    }

    private static void AddSecurity(SwaggerGenOptions options)
    {
        options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
        {
            Description = "Enter Valid Jwt Token",
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
                    new List<string>()
                }
            });
    }

    private static OpenApiInfo CreateVersioninfo(ApiVersionDescription description)
    {
        var info = new OpenApiInfo
        {
            Title = "HR Management System API",
            Version = description.ApiVersion.ToString(),
            Description = "API for the HR Management System."
        };

        if (description.IsDeprecated)
        {
            info.Description = "This API version has been deprecated.";
        }

        return info;
    }
}
