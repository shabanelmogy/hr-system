namespace HrManagementSystem.Infrastructure.Dependencies;

public static class CorsService
{
    public static IServiceCollection AddCorsService(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var settings = configuration
            .GetSection(CorsSettings.SectionName)
            .Get<CorsSettings>() ?? new CorsSettings();

        if (!HasValidOrigins(settings))
        {
            throw new InvalidOperationException(
                "CorsSettings:AllowedOrigins must contain at least one valid HTTP or HTTPS origin.");
        }

        services.AddOptions<CorsSettings>()
            .BindConfiguration(CorsSettings.SectionName)
            .Validate(HasValidOrigins, "Allowed origins must be absolute HTTP or HTTPS origins.")
            .ValidateOnStart();

        services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", policy =>
            {
                policy.WithOrigins(settings.AllowedOrigins.ToArray())
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        return services;
    }

    private static bool HasValidOrigins(CorsSettings settings) =>
        settings.AllowedOrigins.Count > 0 &&
        settings.AllowedOrigins.All(origin =>
            Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
            (string.Equals(uri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase)) &&
            string.Equals(origin.TrimEnd('/'), uri.GetLeftPart(UriPartial.Authority), StringComparison.OrdinalIgnoreCase));
}
