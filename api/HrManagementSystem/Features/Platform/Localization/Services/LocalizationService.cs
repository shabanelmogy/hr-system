using HrManagementSystem.Features.Platform.Localization.Contracts;
using Newtonsoft.Json;

namespace HrManagementSystem.Features.Platform.Localization.Services
{
    public class LocalizationService : ILocalizationService
    {
        private static readonly HashSet<string> SupportedLanguages = new(StringComparer.OrdinalIgnoreCase)
        {
            "en-US",
            "ar-EG"
        };
        private readonly IWebHostEnvironment _environment;

        private readonly LocalizationError _localizationError;

        private readonly IDistributedCache _cache;

        public LocalizationService(IWebHostEnvironment environment, LocalizationError localizationError, IDistributedCache cache)
        {
            _environment = environment;
            _localizationError = localizationError;
            _cache = cache;
        }

        private string GetFilePath(string language) =>
            Path.Combine(_environment.ContentRootPath, "Infrastructure/Localization/Resources", $"{language}.json");

        public async Task<Result<Dictionary<string, string>>> GetLocalization(string language, CancellationToken cancellationToken = default)
        {
            if (!SupportedLanguages.Contains(language))
                return Result.Failure<Dictionary<string, string>>(_localizationError.InvalidLanguage);

            var filePath = GetFilePath(language);

            if (!File.Exists(filePath))
                return Result.Failure<Dictionary<string, string>>(_localizationError.LocalizationFileNotFound);

            var json = await File.ReadAllTextAsync(filePath, cancellationToken);
            var data = JsonConvert.DeserializeObject<Dictionary<string, string>>(json) ?? [];

            return Result.Success(data);
        }

        public async Task<Result> SaveLocalization(string language, Dictionary<string, string> localizationData, CancellationToken cancellationToken = default)
        {
            if (!SupportedLanguages.Contains(language))
                return Result.Failure(_localizationError.InvalidLanguage);

            var filePath = GetFilePath(language);

            Dictionary<string, string> existingData = [];

            if (File.Exists(filePath))
            {
                var existingJson = await File.ReadAllTextAsync(filePath, cancellationToken);
                existingData = JsonConvert.DeserializeObject<Dictionary<string, string>>(existingJson) ?? [];
            }

            foreach (var entry in localizationData)
            {
                existingData[entry.Key] = entry.Value;
            }

            var json = JsonConvert.SerializeObject(existingData, Formatting.Indented);
            await File.WriteAllTextAsync(filePath, json, cancellationToken);

            return Result.Success();
        }

        public async Task<Result> UpdateLocalizationKey(LocalizationRequest request, CancellationToken cancellationToken = default)
        {
            if (!SupportedLanguages.Contains(request.Language))
                return Result.Failure(_localizationError.InvalidLanguage);

            var filePath = GetFilePath(request.Language);

            Dictionary<string, string> existingData = [];

            if (File.Exists(filePath))
            {
                var existingJson = await File.ReadAllTextAsync(filePath, cancellationToken);
                existingData = JsonConvert.DeserializeObject<Dictionary<string, string>>(existingJson) ?? [];
            }

            if (!existingData.ContainsKey(request.Key))
                return Result.Failure(_localizationError.LocalizationKeyNotFound);

            existingData[request.Key] = request.Value;

            var json = JsonConvert.SerializeObject(existingData, Formatting.Indented);
            await File.WriteAllTextAsync(filePath, json, cancellationToken);

            var cacheKey = $"locale_{Thread.CurrentThread.CurrentCulture.Name}_{request.Key}";

            await _cache.RemoveAsync(cacheKey, cancellationToken);

            return Result.Success();
        }

        public async Task<Result> DeleteLocalizationKey(string language, string key, CancellationToken cancellationToken = default)
        {
            if (!SupportedLanguages.Contains(language))
                return Result.Failure(_localizationError.InvalidLanguage);

            var filePath = GetFilePath(language);

            if (!File.Exists(filePath))
                return Result.Failure(_localizationError.LocalizationFileNotFound);

            var existingJson = await File.ReadAllTextAsync(filePath, cancellationToken);
            var existingData = JsonConvert.DeserializeObject<Dictionary<string, string>>(existingJson) ?? [];

            if (!existingData.ContainsKey(key))
                return Result.Failure(_localizationError.LocalizationKeyNotFound);

            existingData.Remove(key);

            var json = JsonConvert.SerializeObject(existingData, Formatting.Indented);
            await File.WriteAllTextAsync(filePath, json, cancellationToken);

            return Result.Success();
        }
    }
}
