using StackExchange.Redis;

namespace ErpSystem.Api.Hosting;

public static class HostDistributedRuntimeServiceCollectionExtensions
{
    public static IServiceCollection AddHostDistributedRuntime(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var settings = GetValidatedSettings(configuration);
        var section = configuration.GetSection(HostDistributedRuntimeSettings.SectionName);

        services.AddOptions<HostDistributedRuntimeSettings>()
            .Bind(section)
            .Validate(IsStructurallyValid, "DistributedRuntime settings are invalid.")
            .ValidateOnStart();

        var signalR = services.AddSignalR();
        if (!settings.Enabled)
        {
            services.AddDistributedMemoryCache();
            return services;
        }

        var redisConnection = configuration.GetConnectionString(settings.RedisConnectionStringName)!;
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnection;
            options.InstanceName = settings.CacheInstanceName;
        });
        signalR.AddStackExchangeRedis(redisConnection, options =>
            options.Configuration.ChannelPrefix = RedisChannel.Literal(settings.SignalRChannelPrefix));

        return services;
    }

    public static HostDistributedRuntimeSettings GetValidatedSettings(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var settings = configuration
            .GetSection(HostDistributedRuntimeSettings.SectionName)
            .Get<HostDistributedRuntimeSettings>() ?? new HostDistributedRuntimeSettings();

        var errors = new List<string>();
        var structurallyValid = IsStructurallyValid(settings);
        if (!structurallyValid)
            errors.Add("DistributedRuntime values are malformed.");

        if (settings.ReplicaCount > 1 && !settings.Enabled)
            errors.Add("DistributedRuntime:Enabled must be true when ReplicaCount is greater than one.");

        if (settings.Enabled && structurallyValid)
        {
            var connectionString = configuration.GetConnectionString(settings.RedisConnectionStringName);
            if (string.IsNullOrWhiteSpace(connectionString) || IsPlaceholder(connectionString))
            {
                errors.Add(
                    $"ConnectionStrings:{settings.RedisConnectionStringName} must be supplied by a secret store when DistributedRuntime is enabled.");
            }
            else
            {
                try
                {
                    _ = ConfigurationOptions.Parse(connectionString);
                }
                catch (ArgumentException)
                {
                    errors.Add(
                        $"ConnectionStrings:{settings.RedisConnectionStringName} must be a valid Redis connection string.");
                }
            }
        }

        if (settings.ReplicaCount > 1)
        {
            if (!settings.ExternalRateLimitingEnabled)
            {
                errors.Add(
                    "DistributedRuntime:ExternalRateLimitingEnabled must be true for multiple replicas.");
            }

            if (!settings.SharedFileStorageEnabled)
            {
                errors.Add(
                    "DistributedRuntime:SharedFileStorageEnabled must be true for multiple replicas.");
            }

            if (!settings.SessionAffinityEnabled)
            {
                errors.Add(
                    "DistributedRuntime:SessionAffinityEnabled must be true for the Redis SignalR backplane with multiple replicas.");
            }
        }

        if (errors.Count == 0)
            return settings;

        throw new InvalidOperationException(
            "Distributed runtime configuration validation failed:" +
            Environment.NewLine +
            string.Join(Environment.NewLine, errors.Select(error => $"- {error}")));
    }

    private static bool IsStructurallyValid(HostDistributedRuntimeSettings settings) =>
        settings.ReplicaCount > 0 &&
        IsSafeToken(settings.RedisConnectionStringName, allowColon: false) &&
        IsSafeToken(settings.CacheInstanceName, allowColon: true) &&
        IsSafeToken(settings.SignalRChannelPrefix, allowColon: true);

    private static bool IsSafeToken(string value, bool allowColon) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= 128 &&
        value.All(character =>
            character is >= 'a' and <= 'z' or >= 'A' and <= 'Z' or >= '0' and <= '9' or
                '.' or '-' or '_' ||
            (allowColon && character == ':'));

    private static bool IsPlaceholder(string value)
    {
        var normalized = value.Trim();
        return (normalized.StartsWith('<') && normalized.EndsWith('>')) ||
            normalized.Contains("YOUR_", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("YOUR-", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("CHANGE_ME", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("CHANGE-ME", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("SET_VIA", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("SET-VIA", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("REPLACE_ME", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("REPLACE-ME", StringComparison.OrdinalIgnoreCase) ||
            normalized.Contains("TODO", StringComparison.OrdinalIgnoreCase);
    }
}
