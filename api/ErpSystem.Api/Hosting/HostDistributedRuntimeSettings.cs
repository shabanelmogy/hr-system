namespace ErpSystem.Api.Hosting;

public sealed class HostDistributedRuntimeSettings
{
    public const string SectionName = "DistributedRuntime";

    public bool Enabled { get; init; }
    public int ReplicaCount { get; init; } = 1;
    public string RedisConnectionStringName { get; init; } = "Redis";
    public string CacheInstanceName { get; init; } = "ErpSystem:";
    public string SignalRChannelPrefix { get; init; } = "ErpSystem";
    public bool ExternalRateLimitingEnabled { get; init; }
    public bool SharedFileStorageEnabled { get; init; }
    public bool SessionAffinityEnabled { get; init; }
}
