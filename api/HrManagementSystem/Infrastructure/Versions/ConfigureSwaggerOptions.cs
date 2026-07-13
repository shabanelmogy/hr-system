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

        // Set the comments path for the Swagger JSON and UI.
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        options.IncludeXmlComments(xmlPath); // Include XML comments for Swagger

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
            Title = "TechnicalSupport", //Title Of Api
            Version = description.ApiVersion.ToString(), //Show beside Title On Top Left
            Description = "API To TechnicalSupport",
            TermsOfService = new Uri("https://example.com/terms"),
            Contact = new OpenApiContact
            {
                Name = "TechnicalSupport",
                Url = new Uri("https://dotnetmastery.com")
            },
            License = new OpenApiLicense
            {
                Name = "Example License",
                Url = new Uri("https://example.com/license")
            }
        };

        if (description.IsDeprecated)
        {
            info.Description = "This is api has been deprecated";
        }

        return info;
    }
}
