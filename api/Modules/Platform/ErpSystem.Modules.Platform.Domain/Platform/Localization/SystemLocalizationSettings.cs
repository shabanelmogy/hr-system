namespace ErpSystem.Modules.Platform.Domain.Platform.Localization;

public sealed class SystemLocalizationSettings
{
    private readonly List<SystemLocalizationOverride> _overrides = [];
    public SystemLocalizationSettings() { }
    public int Id { get; private set; } = 1;
    public int Revision { get; private set; }
    public byte[] RowVersion { get; private set; } = [];
    public IReadOnlyCollection<SystemLocalizationOverride> Overrides => _overrides;
    public bool SetText(string source, string language, string key, string value, int expectedRevision)
    {
        ValidateIdentifier(source, 100, nameof(source)); ValidateLanguage(language); ValidateIdentifier(key, 400, nameof(key)); ValidateValue(value); EnsureRevision(expectedRevision);
        var existing = _overrides.SingleOrDefault(item => item.Source == source && item.Language == language && item.Key == key);
        if (existing?.Value == value) return false;
        if (existing is null) { if (_overrides.Count >= 5000) throw new InvalidOperationException("System localization override limit reached."); _overrides.Add(new(source, language, key, value)); }
        else existing.Change(value);
        Revision = checked(Revision + 1); return true;
    }
    public bool ResetText(string source, string language, string key, int expectedRevision)
    {
        ValidateIdentifier(source, 100, nameof(source)); ValidateLanguage(language); ValidateIdentifier(key, 400, nameof(key)); EnsureRevision(expectedRevision); var existing = _overrides.SingleOrDefault(item => item.Source == source && item.Language == language && item.Key == key);
        if (existing is null) return false; _overrides.Remove(existing); Revision = checked(Revision + 1); return true;
    }
    private void EnsureRevision(int expected) { if (expected != Revision) throw new InvalidOperationException("System localization settings changed."); }
    private static void ValidateLanguage(string language) { if (language is not ("en" or "ar")) throw new ArgumentException("Only en and ar are supported."); }
    private static void ValidateIdentifier(string value, int max, string name) { if (string.IsNullOrWhiteSpace(value) || value != value.Trim() || value.Length > max) throw new ArgumentException("Invalid localization " + name, name); }
    private static void ValidateValue(string value) { if (string.IsNullOrWhiteSpace(value) || value.Length > 4000) throw new ArgumentException("Invalid localization value", nameof(value)); }
}

public sealed class SystemLocalizationOverride
{
    private SystemLocalizationOverride() { }
    internal SystemLocalizationOverride(string source, string language, string key, string value) { Source = source; Language = language; Key = key; Value = value; }
    public int Id { get; private set; } public string Source { get; private set; } = string.Empty; public string Language { get; private set; } = string.Empty; public string Key { get; private set; } = string.Empty; public string Value { get; private set; } = string.Empty;
    internal void Change(string value) => Value = value;
}
