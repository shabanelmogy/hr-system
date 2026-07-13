using Newtonsoft.Json;

namespace HrManagementSystem.Infrastructure.Localization.Configurations
{
    public class JsonStringLocalizer : IStringLocalizer
    {
        private const string ResourcePath = "Infrastructure/Localization/Resources";
        private const string LegacyResourcePath = "Localization/Resources";

        private readonly IDistributedCache _cache;
        private readonly JsonSerializer _serializer = new();

        public JsonStringLocalizer(IDistributedCache cache)
        {
            _cache = cache;
        }

        public LocalizedString this[string name]
        {
            get
            {
                var value = GetString(name);
                return new LocalizedString(name, value);
            }
        }

        public LocalizedString this[string name, params object[] arguments]
        {
            get
            {
                var actualValue = this[name];
                return !actualValue.ResourceNotFound
                    ? new LocalizedString(name, string.Format(actualValue.Value, arguments))
                    : actualValue;
            }
        }

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            var fullFilePath = ResolveResourceFilePath(Thread.CurrentThread.CurrentCulture.Name);

            if (fullFilePath is null)
                yield break;

            using FileStream stream = new(fullFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            using StreamReader streamReader = new(stream);
            using JsonTextReader reader = new(streamReader);

            while (reader.Read())
            {
                if (reader.TokenType != JsonToken.PropertyName)
                    continue;

                var key = reader.Value as string;
                reader.Read();
                var value = _serializer.Deserialize<string>(reader);
                if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(value))
                    yield return new LocalizedString(key, value);
            }
        }

        private string GetString(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return key;

            var culture = Thread.CurrentThread.CurrentCulture.Name;
            var fullFilePath = ResolveResourceFilePath(culture);

            if (fullFilePath is null)
                return key;

            var cacheKey = $"locale_{culture}_{key}";
            var cacheValue = _cache.GetString(cacheKey);

            if (!string.IsNullOrEmpty(cacheValue))
                return cacheValue;

            var result = GetValueFromJSON(key, fullFilePath);

            if (string.IsNullOrWhiteSpace(result))
                return key;

            _cache.SetString(cacheKey, result);

            return result;
        }

        private static string? ResolveResourceFilePath(string culture)
        {
            var currentPath = Path.GetFullPath(Path.Combine(ResourcePath, $"{culture}.json"));
            if (File.Exists(currentPath))
                return currentPath;

            var legacyPath = Path.GetFullPath(Path.Combine(LegacyResourcePath, $"{culture}.json"));
            return File.Exists(legacyPath) ? legacyPath : null;
        }

        private string? GetValueFromJSON(string propertyName, string filePath)
        {
            if (string.IsNullOrEmpty(propertyName) || string.IsNullOrEmpty(filePath))
                return null;

            using FileStream stream = new(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            using StreamReader streamReader = new(stream);
            using JsonTextReader reader = new(streamReader);

            while (reader.Read())
            {
                if (reader.TokenType == JsonToken.PropertyName && reader.Value as string == propertyName)
                {
                    reader.Read();
                    return _serializer.Deserialize<string>(reader);
                }
            }

            return null;
        }

        // Method to clear the cache after editing a key
        public void ClearCache(string key)
        {
            var cacheKey = $"locale_{Thread.CurrentThread.CurrentCulture.Name}_{key}";
            _cache.Remove(cacheKey);
        }

        // Method to update the cache after editing a key
        public void UpdateCache(string key, string value)
        {
            var cacheKey = $"locale_{Thread.CurrentThread.CurrentCulture.Name}_{key}";
            _cache.SetString(cacheKey, value);
        }
    }
}
