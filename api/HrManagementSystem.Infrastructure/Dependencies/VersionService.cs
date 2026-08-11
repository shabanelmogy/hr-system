namespace HrManagementSystem.Infrastructure.Dependencies;

public static class VersionService
{
    public static IServiceCollection AddVersionService(this IServiceCollection services)
    {
        services.AddApiVersioning(config =>
        {
            config.DefaultApiVersion = new ApiVersion(1, 0);
            config.AssumeDefaultVersionWhenUnspecified = true; //when client call unspecific version go To Default
            config.ReportApiVersions = true; // create in headers available versions
            config.ApiVersionReader = new UrlSegmentApiVersionReader(); //version in url
        }).AddApiExplorer(config =>
        {
            config.GroupNameFormat = "'v'VVV";
            config.SubstituteApiVersionInUrl = true; //To Put ApiVersion Above Control Dynamic
        });
        services.AddEndpointsApiExplorer();
        return services;
    }
}
