using System.Collections.Concurrent;
using System.Globalization;
using System.Reflection;
using System.Text.Json;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Localization;

public sealed class AccountingLedgerSetupJsonLocalizer : ILedgerSetupLocalizer
{
    private const string DefaultCulture = "en-US";
    private readonly Assembly _assembly = typeof(AccountingLedgerSetupJsonLocalizer).Assembly;
    private readonly ConcurrentDictionary<string, IReadOnlyDictionary<string, string>> _resources =
        new(StringComparer.OrdinalIgnoreCase);

    public string Text(string key)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);

        foreach (var culture in CandidateCultures(CultureInfo.CurrentUICulture))
        {
            var values = _resources.GetOrAdd(culture, Load);
            if (values.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
                return value;
        }

        return key;
    }

    public string Format(string key, params object[] arguments) =>
        string.Format(CultureInfo.CurrentCulture, Text(key), arguments);

    private IReadOnlyDictionary<string, string> Load(string culture)
    {
        var suffix = $".Localization.Resources.{culture}.json";
        var resourceName = _assembly.GetManifestResourceNames()
            .SingleOrDefault(name => name.EndsWith(suffix, StringComparison.OrdinalIgnoreCase));

        if (resourceName is null)
            return new Dictionary<string, string>(StringComparer.Ordinal);

        using var stream = _assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"Embedded Accounting localization resource '{resourceName}' could not be opened.");

        return JsonSerializer.Deserialize<Dictionary<string, string>>(stream)
            ?? new Dictionary<string, string>(StringComparer.Ordinal);
    }

    private static IEnumerable<string> CandidateCultures(CultureInfo culture)
    {
        if (culture.Name.StartsWith("ar", StringComparison.OrdinalIgnoreCase))
            yield return "ar-EG";
        else if (!string.IsNullOrWhiteSpace(culture.Name))
            yield return culture.Name;

        yield return DefaultCulture;
    }
}
