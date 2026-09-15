using System.Security.Claims;
using System.Threading.RateLimiting;
using Asp.Versioning;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Messaging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using System.Text;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ErpSystem.Api.Hosting;

public static class HostInfrastructureServiceCollectionExtensions
{
    public const string BrowserCorsPolicy = "AllowReactApp";

    public static IServiceCollection AddErpHostInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IEnumerable<string> moduleNames)
    {
        services.AddHostForwardedHeaders(configuration);
        services.AddHostCors(configuration);
        services.AddHostSharedRuntime(configuration);
        services.AddExceptionHandler<HostGlobalExceptionHandler>();
        services.AddProblemDetails();
        services.Configure<MvcOptions>(options =>
            options.Filters.Add(new HostProblemDetailsResultFilter()));
        services.AddHostRateLimiting();
        services.AddHostApiVersioning();
        services.AddHostSwagger();
        services.AddHostOpenTelemetry(configuration);
        services.AddHostHealthChecks(configuration, moduleNames);
        return services;
    }

    public static IServiceCollection AddHostSharedRuntime(
        this IServiceCollection services,
        IConfiguration? configuration = null)
    {
        configuration ??= new ConfigurationBuilder().Build();
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        services.AddHttpContextAccessor();
        services.AddLocalization();
        services.AddScoped<HttpCurrentExecutionContext>();
        services.AddScoped<ICurrentExecutionContext>(provider =>
            provider.GetRequiredService<HttpCurrentExecutionContext>());
        services.AddScoped<ICurrentExecutionContextScope>(provider =>
            provider.GetRequiredService<HttpCurrentExecutionContext>());
        services.AddScoped<IIntegrationEventPublisher, InProcessIntegrationEventPublisher>();
        services.AddHostDataProtection(configuration);
        services.AddHostDistributedRuntime(configuration);
        services.AddHybridCache(options =>
        {
            options.DefaultEntryOptions = new HybridCacheEntryOptions
            {
                Expiration = TimeSpan.FromMinutes(10),
                LocalCacheExpiration = TimeSpan.FromMinutes(2)
            };
        });

        return services;
    }

    public static IServiceCollection AddHostCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var settings = configuration
            .GetSection(HostCorsSettings.SectionName)
            .Get<HostCorsSettings>() ?? new HostCorsSettings();

        if (!HasValidOrigins(settings))
        {
            throw new InvalidOperationException(
                "CorsSettings:AllowedOrigins must contain only valid HTTP or HTTPS origins.");
        }

        services.AddOptions<HostCorsSettings>()
            .BindConfiguration(HostCorsSettings.SectionName)
            .Validate(HasValidOrigins, "Allowed origins must be absolute HTTP or HTTPS origins.")
            .ValidateOnStart();

        services.AddCors(options =>
        {
            options.AddPolicy(BrowserCorsPolicy, policy =>
            {
                if (settings.AllowedOrigins.Count > 0)
                    policy.WithOrigins(settings.AllowedOrigins.ToArray());

                policy.AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .WithExposedHeaders(HostCorrelationContext.HeaderName);
            });
        });

        return services;
    }

    public static IServiceCollection AddHostRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                CreateFixedWindowPartition(context, "global", 120, TimeSpan.FromMinutes(1)));

            options.AddPolicy("authentication", context =>
                CreateFixedWindowPartition(context, "authentication", 10, TimeSpan.FromMinutes(1)));
            options.AddPolicy("fileOperations", context =>
                CreateFixedWindowPartition(context, "files", 30, TimeSpan.FromMinutes(1)));

            options.OnRejected = async (context, cancellationToken) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

                await HostProblemDetails.WriteAsync(context.HttpContext, new ProblemDetails
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too many requests",
                    Detail = "Please wait before retrying the request.",
                    Type = "https://httpstatuses.io/429"
                }, cancellationToken);
            };
        });

        return services;
    }

    public static IServiceCollection AddHostApiVersioning(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = new UrlSegmentApiVersionReader();
        }).AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        services.AddEndpointsApiExplorer();
        return services;
    }

    public static IServiceCollection AddHostSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen();
        services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
        return services;
    }

    public static IServiceCollection AddHostHealthChecks(
        this IServiceCollection services,
        IConfiguration configuration,
        IEnumerable<string> moduleNames)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentNullException.ThrowIfNull(moduleNames);

        var moduleNameList = moduleNames.ToArray();
        var healthChecks = services.AddHealthChecks();

        foreach (var moduleName in moduleNameList)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(moduleName);

            // Follow the same connection convention used by module infrastructure:
            // ConnectionStrings:<ModuleName> overrides DefaultConnection. A separate
            // readiness registration is intentional even when modules share the same
            // database so operators can see which installed module dependency failed.
            var connectionString = configuration.GetConnectionString(moduleName)
                ?? configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    $"Connection string '{moduleName}' or 'DefaultConnection' not found.");

            healthChecks.AddSqlServer(
                connectionString: connectionString,
                name: $"database:{moduleName}",
                tags: [HostHealthCheckPredicates.ReadinessTag]);
        }

        healthChecks.AddHangfire(
            options => options.MinimumAvailableServers = 1,
            tags: [HostHealthCheckPredicates.ReadinessTag]);
        healthChecks.AddCheck<ModuleSchemaCompatibilityHealthCheck>(
            "module-schema",
            tags: [HostHealthCheckPredicates.ReadinessTag]);
        var crystalRuntimeEnabled = configuration.GetValue<bool>("CrystalReports:RuntimeEnabled");
        var crystalRuntimeBaseUrl = configuration["CrystalReports:RuntimeBaseUrl"];
        if (moduleNameList.Contains("Reporting", StringComparer.OrdinalIgnoreCase) &&
            crystalRuntimeEnabled)
        {
            if (!Uri.TryCreate(crystalRuntimeBaseUrl, UriKind.Absolute, out var crystalRuntimeUri) ||
                (crystalRuntimeUri.Scheme != Uri.UriSchemeHttp && crystalRuntimeUri.Scheme != Uri.UriSchemeHttps) ||
                !string.IsNullOrEmpty(crystalRuntimeUri.UserInfo))
                throw new InvalidOperationException(
                    "CrystalReports:RuntimeBaseUrl must be an absolute HTTP or HTTPS URL without user information when RuntimeEnabled is true.");

            services.AddHttpClient<CrystalReportRuntimeHealthCheck>(client =>
            {
                client.BaseAddress = new Uri(
                    crystalRuntimeUri.AbsoluteUri.TrimEnd('/') + "/",
                    UriKind.Absolute);
                client.Timeout = TimeSpan.FromSeconds(5);
            });
            healthChecks.AddCheck<CrystalReportRuntimeHealthCheck>(
                "reporting:crystal-runtime",
                tags: [HostHealthCheckPredicates.ReadinessTag],
                timeout: TimeSpan.FromSeconds(6));
        }
        if (HostDistributedRuntimeServiceCollectionExtensions
            .GetValidatedSettings(configuration).Enabled)
        {
            healthChecks.AddCheck<HostDistributedRuntimeHealthCheck>(
                "distributed-runtime:redis",
                tags: [HostHealthCheckPredicates.ReadinessTag],
                timeout: TimeSpan.FromSeconds(5));
        }

        return services;
    }

    private static bool HasValidOrigins(HostCorsSettings settings) =>
        settings.AllowedOrigins.Count == 0 ||
        settings.AllowedOrigins.All(origin =>
            Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
            (string.Equals(uri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase)) &&
            string.Equals(origin.TrimEnd('/'), uri.GetLeftPart(UriPartial.Authority), StringComparison.OrdinalIgnoreCase));

    private static RateLimitPartition<string> CreateFixedWindowPartition(
        HttpContext context,
        string policy,
        int permitLimit,
        TimeSpan window)
    {
        var subject = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.Connection.RemoteIpAddress?.ToString()
            ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(
            $"{policy}:{subject}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = window,
                QueueLimit = 0,
                AutoReplenishment = true
            });
    }
}

/// <summary>
/// Central predicates for the host health endpoints. Liveness deliberately
/// executes no dependency checks; readiness contains only registrations tagged
/// as external runtime dependencies.
/// </summary>
public static class HostHealthCheckPredicates
{
    public const string ReadinessTag = "ready";

    public static bool IsReadiness(HealthCheckRegistration registration) =>
        registration.Tags.Contains(ReadinessTag);

    public static bool IsLiveness(HealthCheckRegistration _) => false;
}
