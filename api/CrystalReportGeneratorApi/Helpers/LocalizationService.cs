using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;

public class LocalizationService
{
    private readonly Dictionary<string, string> _localizationStrings;

    public LocalizationService(string culture)
    {
        string filePath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~/Localizations"), $"localization.{culture}.json");

        if (!File.Exists(filePath))
            throw new FileNotFoundException($"Localization file not found: {filePath}");

        var jsonContent = File.ReadAllText(filePath);

        _localizationStrings = JsonConvert.DeserializeObject<Dictionary<string, string>>(jsonContent);
    }

    public string GetLocalizedString(string key)
    {
        return _localizationStrings.TryGetValue(key, out var value) ? value : $"[{key}]";
    }
}
