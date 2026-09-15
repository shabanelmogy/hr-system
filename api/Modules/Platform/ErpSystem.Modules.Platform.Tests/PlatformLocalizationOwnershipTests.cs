using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Localization;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformLocalizationOwnershipTests
{
    [Fact]
    public async Task PlatformPolicy_PreservesLanguageAndMissingResourceSemantics()
    {
        var store = new MemoryLocalizationStore();
        var effects = new RecordingLocalizationEffects();
        using var provider = BuildProvider(store, effects);
        var sender = provider.GetRequiredService<ISender>();

        var invalid = await sender.Send(new GetLocalizationQuery("fr-FR"));
        var missing = await sender.Send(new GetLocalizationQuery("en-US"));
        var updateMissing = await sender.Send(
            new UpdateLocalizationKeyCommand(new LocalizationKeyUpdate("en-US", "Missing", "Value")));
        var deleteMissing = await sender.Send(new DeleteLocalizationKeyCommand("ar-EG", "Missing"));

        Assert.Equal("Localization.InvalidLanguage", invalid.Error.Code);
        Assert.Equal("Localization.LocalizationFileNotFound", missing.Error.Code);
        Assert.Equal("Localization.LocalizationKeyNotFound", updateMissing.Error.Code);
        Assert.Equal("Localization.LocalizationFileNotFound", deleteMissing.Error.Code);
    }

    [Fact]
    public async Task PlatformPolicy_PreservesMergeUpdateDeleteAndEffectsOrdering()
    {
        var store = new MemoryLocalizationStore();
        store.Values["en-US"] = new Dictionary<string, string>
        {
            ["Existing"] = "Before"
        };
        var effects = new RecordingLocalizationEffects();
        using var provider = BuildProvider(store, effects);
        var sender = provider.GetRequiredService<ISender>();

        Assert.True((await sender.Send(new SaveLocalizationCommand("en-US", new Dictionary<string, string>
        {
            ["Added"] = "One"
        }))).IsSuccess);
        Assert.True((await sender.Send(
            new UpdateLocalizationKeyCommand(new LocalizationKeyUpdate("en-US", "Existing", "After")))).IsSuccess);
        Assert.True((await sender.Send(new DeleteLocalizationKeyCommand("en-US", "Added"))).IsSuccess);

        Assert.Equal("After", store.Values["en-US"]["Existing"]);
        Assert.DoesNotContain("Added", store.Values["en-US"].Keys);
        Assert.Equal(["Update:en-US", "Update:en-US:Existing", "Delete:en-US:Added"], effects.Changes);
        Assert.Equal([("en-US", "Existing")], effects.Invalidations);
    }

    [Fact]
    public void LocalizationPolicy_IsPlatformOwnedWithoutHrDependency()
    {
        Assert.Equal(
            "ErpSystem.Modules.Platform.Application",
            typeof(GetLocalizationQuery).Assembly.GetName().Name);

        var references = typeof(GetLocalizationQuery).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(references, reference =>
            reference?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);

        var controllerType = typeof(Presentation.Features.Platform.Localization.V1.LocalizationController);
        var constructor = controllerType.GetConstructors().Single();
        Assert.Equal([typeof(ISender)], constructor.GetParameters().Select(parameter => parameter.ParameterType));
    }

    private static ServiceProvider BuildProvider(
        ILocalizationResourceStore store,
        ILocalizationEffects effects)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddLocalization();
        services.AddSingleton(store);
        services.AddSingleton(effects);
        services.AddPlatformApplication();
        return services.BuildServiceProvider();
    }

    private sealed class MemoryLocalizationStore : ILocalizationResourceStore
    {
        public Dictionary<string, Dictionary<string, string>> Values { get; } =
            new(StringComparer.OrdinalIgnoreCase);

        public Task<Dictionary<string, string>?> ReadAsync(
            string language,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(Values.TryGetValue(language, out var values)
                ? new Dictionary<string, string>(values)
                : null);

        public Task WriteAsync(
            string language,
            IReadOnlyDictionary<string, string> values,
            CancellationToken cancellationToken = default)
        {
            Values[language] = values.ToDictionary(entry => entry.Key, entry => entry.Value);
            return Task.CompletedTask;
        }
    }

    private sealed class RecordingLocalizationEffects : ILocalizationEffects
    {
        public List<(string Language, string Key)> Invalidations { get; } = [];
        public List<string> Changes { get; } = [];

        public Task InvalidateKeyAsync(
            string language,
            string key,
            CancellationToken cancellationToken = default)
        {
            Invalidations.Add((language, key));
            return Task.CompletedTask;
        }

        public void DispatchChange(string action, string entityId) =>
            Changes.Add($"{action}:{entityId}");
    }
}

