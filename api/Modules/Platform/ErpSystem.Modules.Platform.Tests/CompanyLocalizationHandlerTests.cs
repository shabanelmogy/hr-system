using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyLocalizationHandlerTests
{
    [Theory]
    [InlineData("unknown", "ar", "welcome", "مرحبا {{name}}")]
    [InlineData("web:common", "fr", "welcome", "Bonjour {{name}}")]
    [InlineData("web:common", "ar", "welcome", "   ")]
    [InlineData("web:common", "ar", "welcome", "مرحبا")]
    public async Task Invalid_text_requests_do_not_write(string source, string language, string key, string value)
    {
        var store = new Store(); var handler = Commands(store);
        var result = await handler.Handle(new SetCompanyTextCommand(new(source, language, key, value, 0)), default);
        Assert.True(result.IsFailure); Assert.Empty(store.Changes);
    }

    [Fact]
    public async Task Valid_text_preserves_whitespace_exactly()
    {
        var store = new Store(); var handler = Commands(store);
        var result = await handler.Handle(new SetCompanyTextCommand(new("web:common", "ar", "welcome", " مرحبا {{name}} ", 0)), default);
        Assert.True(result.IsSuccess);
        Assert.Equal(" مرحبا {{name}} ", Assert.Single(store.Changes).Value);
    }

    [Fact]
    public async Task Runtime_requires_matching_catalog_version_then_delegates()
    {
        var store = new Store(); var handler = Queries(store);
        var stale = await handler.Handle(new GetCompanyLocalizationRuntimeQuery("web", "stale"), default);
        Assert.True(stale.IsFailure); Assert.Equal("CompanyLocalizations.CatalogOutdated", stale.Error.Code); Assert.Equal(0, store.RuntimeReads);
        var valid = await handler.Handle(new GetCompanyLocalizationRuntimeQuery("web", "web-v1"), default);
        Assert.True(valid.IsSuccess); Assert.Equal(1, store.RuntimeReads);
    }

    [Fact]
    public async Task Text_query_rejects_invalid_paging_without_read()
    {
        var store = new Store(); var handler = Queries(store);
        var result = await handler.Handle(new GetCompanyLocalizationTextsQuery(new("web:common", "en", "ar", "", "all", 0, 101)), default);
        Assert.True(result.IsFailure); Assert.Empty(store.TextQueries);
    }

    [Theory]
    [InlineData("web:reference-countries", "countries.title")]
    [InlineData("web:common", "menu.countries")]
    public async Task System_text_set_and_reset_are_forbidden_without_delegating(string source, string key)
    {
        var store = new Store(); var handler = Commands(store);
        var set = await handler.Handle(new SetCompanyTextCommand(new(source, "ar", key, "تغيير", 0)), default);
        var reset = await handler.Handle(new ResetCompanyTextCommand(new(source, "ar", key, 0)), default);
        Assert.Equal(ErrorType.Forbidden, set.Error.Type);
        Assert.Equal(ErrorType.Forbidden, reset.Error.Type);
        Assert.Empty(store.Changes);
    }

    [Fact]
    public async Task System_source_text_query_is_forbidden_without_reading_store()
    {
        var store = new Store(); var handler = Queries(store);
        var result = await handler.Handle(new GetCompanyLocalizationTextsQuery(new("web:reference-countries", "en", "ar", "", "all", 1, 10)), default);
        Assert.Equal(ErrorType.Forbidden, result.Error.Type);
        Assert.Empty(store.TextQueries);
    }

    private static CompanyLocalizationCommandHandler Commands(Store store) => new(store, new Catalog(), new CompanyLocalizationErrors(new Localizer()));
    private static CompanyLocalizationQueryHandler Queries(Store store) => new(store, new Catalog(), new CompanyLocalizationErrors(new Localizer()));

    private sealed class Catalog : ICompanyUiCatalog
    {
        public IReadOnlyList<CompanyUiSource> Sources { get; } = [
            new("web:common", "web", "common", [new("welcome", "Welcome {{name}}", "مرحبا {{name}}", "shared"), new("count", "{0}", "{0}", "shared"), new("menu.countries", "Countries", "الدول", "system")]),
            new("web:reference-countries", "web", "reference-countries", [new("countries.title", "Countries", "الدول", "system")])];
        public string GetVersion(string client) => client == "web" ? "web-v1" : "mobile-v1";
    }
    private sealed class Store : ICompanyLocalizationStore
    {
        public List<CompanyLocalizationChange> Changes { get; } = []; public List<CompanyLocalizationTextsQuery> TextQueries { get; } = []; public int RuntimeReads { get; private set; }
        public Task<Result> ApplyAsync(CompanyLocalizationChange change, CancellationToken token) { Changes.Add(change); return Task.FromResult(Result.Success()); }
        public Task<CompanyLocalizationSettingsResponse?> GetSettingsAsync(CancellationToken token) => Task.FromResult<CompanyLocalizationSettingsResponse?>(null);
        public Task<CompanyLocalizationTextsResponse?> GetTextsAsync(CompanyLocalizationTextsQuery query, CancellationToken token) { TextQueries.Add(query); return Task.FromResult<CompanyLocalizationTextsResponse?>(null); }
        public Task<CompanyLocalizationRuntimeResponse?> GetRuntimeAsync(string client, CancellationToken token) { RuntimeReads++; return Task.FromResult<CompanyLocalizationRuntimeResponse?>(new("tenant", 1, "en", 0, "web-v1", [])); }
    }
    private sealed class Localizer : IStringLocalizer<CompanyLocalizationErrors>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
        public IStringLocalizer WithCulture(System.Globalization.CultureInfo culture) => this;
    }
}
