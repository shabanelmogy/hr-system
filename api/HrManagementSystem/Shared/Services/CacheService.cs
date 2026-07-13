using System.Text.Json;

namespace HrManagementSystem.Shared.Services
{
    public class CacheService(IDistributedCache distributedCache, ILogger<CacheService> logger) : ICacheService
    {
        private readonly IDistributedCache _distributedCache = distributedCache;
        private readonly ILogger<CacheService> _logger = logger;

        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
        {
            _logger.LogInformation("Get cache with key: {key}", key);

            var cachedValue = await _distributedCache.GetStringAsync(key, cancellationToken);

            return cachedValue is null
                ? null
                : JsonSerializer.Deserialize<T>(cachedValue);
        }

        public async Task SetAsync<T>(string key, T value, CancellationToken cancellationToken = default) where T : class
        {
            _logger.LogInformation("Set cache with key: {key}", key);

            await _distributedCache.SetStringAsync(
                key,
                JsonSerializer.Serialize(value),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
                    SlidingExpiration = TimeSpan.FromMinutes(2)
                },
                cancellationToken);
        }

        public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Remove cache with key: {key}", key);

            await _distributedCache.RemoveAsync(key, cancellationToken);
        }
    }
}
