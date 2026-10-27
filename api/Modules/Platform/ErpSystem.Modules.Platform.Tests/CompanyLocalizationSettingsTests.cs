using ErpSystem.Modules.Platform.Domain.Companies.Entities;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyLocalizationSettingsTests
{
    [Fact]
    public void Defaults_to_English_and_tracks_mutation_revision_and_noops()
    {
        var settings = new CompanyLocalizationSettings("tenant", 1);
        Assert.Equal("en", settings.DefaultLanguage);
        Assert.False(settings.SetDefaultLanguage("en", 0));
        Assert.True(settings.SetDefaultLanguage("ar", 0));
        Assert.Equal(1, settings.Revision);
        Assert.True(settings.SetText("web:common", "ar", "welcome", " مرحبا {{name}} ", 1));
        Assert.Equal(" مرحبا {{name}} ", Assert.Single(settings.Overrides).Value);
        Assert.False(settings.SetText("web:common", "ar", "welcome", " مرحبا {{name}} ", 2));
        Assert.True(settings.ResetText("web:common", "ar", "welcome", 2));
        Assert.False(settings.ResetText("web:common", "ar", "welcome", 3));
    }

    [Theory]
    [InlineData("fr")]
    [InlineData("")]
    public void Rejects_invalid_languages(string language)
    {
        var settings = new CompanyLocalizationSettings("tenant", 1);
        Assert.Throws<ArgumentException>(() => settings.SetDefaultLanguage(language, 0));
    }

    [Fact]
    public void Rejects_stale_invalid_identifiers_and_whitespace_only_values()
    {
        var settings = new CompanyLocalizationSettings("tenant", 1);
        Assert.Throws<InvalidOperationException>(() => settings.SetText("source", "en", "key", "value", 1));
        Assert.Throws<ArgumentException>(() => settings.SetText(" source", "en", "key", "value", 0));
        Assert.Throws<ArgumentException>(() => settings.SetText("source", "en", "key", "   ", 0));
        Assert.Throws<ArgumentException>(() => settings.ResetText(" source", "en", "key", 0));
    }

    [Theory]
    [InlineData("Hello {{name}}", "مرحبا {{name}}", true)]
    [InlineData("{0} {{name}}", "{{name}} {0}", true)]
    [InlineData("{{name}} {{name}}", "{{name}}", false)]
    [InlineData("{{name}}", "{{user}}", false)]
    [InlineData("{0}", "{1}", false)]
    public void Compares_exact_placeholder_multisets(string baseline, string value, bool expected) =>
        Assert.Equal(expected, CompanyLocalizationTextPolicy.HasMatchingPlaceholders(baseline, value));
}
