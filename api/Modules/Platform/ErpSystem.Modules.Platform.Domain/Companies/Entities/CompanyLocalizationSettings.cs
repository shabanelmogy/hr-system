namespace ErpSystem.Modules.Platform.Domain.Companies.Entities;

public sealed class CompanyLocalizationSettings : ErpSystem.BuildingBlocks.Domain.Abstractions.ICompanyScoped
{
    private readonly List<CompanyLocalizationOverride> _overrides = [];
    private CompanyLocalizationSettings() { }
    public CompanyLocalizationSettings(string tenantId, int companyId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        if (tenantId.Length > 32) throw new ArgumentOutOfRangeException(nameof(tenantId));
        if (companyId <= 0) throw new ArgumentOutOfRangeException(nameof(companyId));
        TenantId = tenantId; CompanyId = companyId;
    }
    public int Id { get; private set; }
    public string TenantId { get; private set; } = string.Empty;
    public int CompanyId { get; private set; }
    public string DefaultLanguage { get; private set; } = "en";
    public int Revision { get; private set; }
    public byte[] RowVersion { get; private set; } = [];
    public IReadOnlyCollection<CompanyLocalizationOverride> Overrides => _overrides;
    string ErpSystem.BuildingBlocks.Domain.Abstractions.ITenantScoped.TenantId { get => TenantId; set => TenantId = value; }
    int ErpSystem.BuildingBlocks.Domain.Abstractions.ICompanyScoped.CompanyId { get => CompanyId; set => CompanyId = value; }
    public bool SetDefaultLanguage(string language, int expectedRevision)
    {
        ValidateLanguage(language); EnsureRevision(expectedRevision);
        if (DefaultLanguage == language) return false;
        DefaultLanguage = language; Revision = checked(Revision + 1); return true;
    }
    public bool SetText(string source, string language, string key, string value, int expectedRevision)
    {
        ValidateIdentifier(source, 100, nameof(source)); ValidateLanguage(language); ValidateIdentifier(key, 400, nameof(key)); ValidateValue(value); EnsureRevision(expectedRevision);
        var existing = _overrides.SingleOrDefault(item => item.Source == source && item.Language == language && item.Key == key);
        if (existing?.Value == value) return false;
        if (existing is null) { if (_overrides.Count >= 5000) throw new InvalidOperationException("Company localization override limit reached."); _overrides.Add(new(source, language, key, value)); }
        else existing.Change(value);
        Revision = checked(Revision + 1); return true;
    }
    public bool ResetText(string source, string language, string key, int expectedRevision)
    {
        ValidateIdentifier(source, 100, nameof(source)); ValidateLanguage(language); ValidateIdentifier(key, 400, nameof(key)); EnsureRevision(expectedRevision); var existing = _overrides.SingleOrDefault(item => item.Source == source && item.Language == language && item.Key == key);
        if (existing is null) return false; _overrides.Remove(existing); Revision = checked(Revision + 1); return true;
    }
    private void EnsureRevision(int expected) { if (expected != Revision) throw new InvalidOperationException("Company localization settings changed."); }
    private static void ValidateLanguage(string language) { if (language is not ("en" or "ar")) throw new ArgumentException("Only en and ar are supported."); }
    private static void ValidateIdentifier(string value, int max, string name) { if (string.IsNullOrWhiteSpace(value) || value != value.Trim() || value.Length > max) throw new ArgumentException("Invalid localization " + name, name); }
    private static void ValidateValue(string value) { if (string.IsNullOrWhiteSpace(value) || value.Length > 4000) throw new ArgumentException("Invalid localization value", nameof(value)); }
}

public static class CompanyLocalizationTextPolicy
{
    private static readonly System.Text.RegularExpressions.Regex Placeholder = new(@"\{\{[^{}]+\}\}|\{\d+(?:[^{}]*)\}|<\/?\d+>", System.Text.RegularExpressions.RegexOptions.Compiled);
    public static bool HasMatchingPlaceholders(string baseline, string value)
    {
        ArgumentNullException.ThrowIfNull(baseline); ArgumentNullException.ThrowIfNull(value);
        return Placeholder.Matches(baseline).Select(match => match.Value).Order(StringComparer.Ordinal)
            .SequenceEqual(Placeholder.Matches(value).Select(match => match.Value).Order(StringComparer.Ordinal), StringComparer.Ordinal);
    }
}
public sealed class CompanyLocalizationOverride
{
    private CompanyLocalizationOverride() { }
    internal CompanyLocalizationOverride(string source, string language, string key, string value) { Source = source; Language = language; Key = key; Value = value; }
    public int Id { get; private set; } public string Source { get; private set; } = string.Empty; public string Language { get; private set; } = string.Empty; public string Key { get; private set; } = string.Empty; public string Value { get; private set; } = string.Empty;
    internal void Change(string value) => Value = value;
}
