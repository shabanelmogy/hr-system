using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;

namespace ErpSystem.BuildingBlocks.Modularity;

/// <summary>
/// Explicit, deterministic catalog of modules. The host passes module instances
/// in registry order; dependency metadata produces a stable topological lifecycle
/// order without assembly scanning.
/// </summary>
public sealed class ModuleCatalog
{
    // Fixed naming rule so duplicate detection and diagnostics stay stable:
    // start with a letter, then letters, digits, dot, underscore, or hyphen.
    private static readonly Regex NamePattern =
        new("^[A-Za-z][A-Za-z0-9_.-]{0,63}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private static readonly Regex CodePattern =
        new("^[a-z][a-z0-9-]{0,63}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private static readonly Regex VersionPattern =
        new("^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private readonly List<IModule> _modules;
    private readonly List<ModuleDefinition> _definitions;
    private readonly List<IModule> _lifecycleModules;
    private readonly List<ModuleDefinition> _userVisibleDefinitions;
    private readonly List<ModuleDefinition> _tenantEntitlementDefinitions;

    public ModuleCatalog(IEnumerable<IModule> modules)
    {
        ArgumentNullException.ThrowIfNull(modules);

        // Single materialization: the source may be a one-shot enumerable.
        _modules = modules.ToList();

        if (_modules.Any(static m => m is null))
            throw new ArgumentException("Module catalog must not contain null modules.", nameof(modules));

        _definitions = new List<ModuleDefinition>(_modules.Count);
        foreach (var module in _modules)
        {
            if (string.IsNullOrWhiteSpace(module.Name))
                throw new InvalidOperationException("Module name must be a non-empty value.");

            if (!NamePattern.IsMatch(module.Name))
                throw new InvalidOperationException(
                    $"Invalid module name '{module.Name}'. Use letters, digits, '.', '_', or '-' starting with a letter (max 64 chars).");

            var definition = module.Definition;
            ValidateDefinition(definition, module.Name);
            _definitions.Add(definition);
        }

        var duplicates = _modules
            .GroupBy(m => m.Name, StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicates.Count > 0)
            throw new InvalidOperationException(
                $"Duplicate module names: {string.Join(", ", duplicates)}. Module names must be unique (case-insensitive).");

        var duplicateCodes = _definitions
            .GroupBy(definition => definition.Code, StringComparer.OrdinalIgnoreCase)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToArray();
        if (duplicateCodes.Length > 0)
            throw new InvalidOperationException(
                $"Duplicate module codes: {string.Join(", ", duplicateCodes)}. Module codes must be unique (case-insensitive).");

        _lifecycleModules = BuildLifecycleOrder(_modules, _definitions);
        _userVisibleDefinitions = _definitions.Where(static definition => definition.IsUserVisible).ToList();
        _tenantEntitlementDefinitions = _definitions.Where(static definition => definition.AllowsTenantEntitlement).ToList();
    }

    public IReadOnlyList<IModule> Modules => _modules.AsReadOnly();

    public IReadOnlyList<ModuleDefinition> Definitions => _definitions.AsReadOnly();

    /// <summary>
    /// User-facing application definitions in explicit registry order. Technical
    /// modules stay in <see cref="Definitions"/> and <see cref="LifecycleModules"/>
    /// but are not exposed through application launchers.
    /// </summary>
    public IReadOnlyList<ModuleDefinition> UserVisibleDefinitions => _userVisibleDefinitions.AsReadOnly();

    /// <summary>
    /// Definitions that may participate in tenant entitlement management. This
    /// deliberately does not imply anything about technical dependencies or user
    /// permission checks.
    /// </summary>
    public IReadOnlyList<ModuleDefinition> TenantEntitlementDefinitions => _tenantEntitlementDefinitions.AsReadOnly();

    /// <summary>
    /// Stable dependency-aware startup order. Registry order is preserved among
    /// modules that are simultaneously eligible to run.
    /// </summary>
    public IReadOnlyList<IModule> LifecycleModules => _lifecycleModules.AsReadOnly();

    public ModuleDefinition? FindDefinition(string code) =>
        Definitions.FirstOrDefault(definition =>
            string.Equals(definition.Code, code, StringComparison.OrdinalIgnoreCase));

    private static void ValidateDefinition(ModuleDefinition definition, string moduleName)
    {
        if (definition is null)
            throw new InvalidOperationException($"Module '{moduleName}' must provide a definition.");
        if (!CodePattern.IsMatch(definition.Code))
            throw new InvalidOperationException($"Invalid module code '{definition.Code}'.");
        if (!string.Equals(definition.Name, moduleName, StringComparison.Ordinal))
            throw new InvalidOperationException($"Module definition name must match '{moduleName}'.");
        if (string.IsNullOrWhiteSpace(definition.Version) || !VersionPattern.IsMatch(definition.Version))
            throw new InvalidOperationException(
                $"Module '{moduleName}' has invalid version '{definition.Version}'. Use a stable release semantic version such as 1.0.0.");
        if (definition.Submodules is null)
            throw new InvalidOperationException($"Module '{moduleName}' must provide a submodule collection.");
        if (definition.Submodules.Any(static submodule => submodule is null))
            throw new InvalidOperationException($"Module '{moduleName}' must not contain null submodules.");
        if (definition.IsDefault && !definition.AllowsTenantEntitlement)
            throw new InvalidOperationException(
                $"Module '{moduleName}' cannot be a default tenant entitlement when tenant entitlement is disabled.");

        ValidateDependencies(definition, moduleName);

        var duplicateSubmodules = definition.Submodules
            .GroupBy(submodule => submodule.Code, StringComparer.OrdinalIgnoreCase)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToArray();
        if (duplicateSubmodules.Length > 0)
            throw new InvalidOperationException(
                $"Duplicate submodule codes in '{moduleName}': {string.Join(", ", duplicateSubmodules)}.");

        foreach (var submodule in definition.Submodules)
        {
            if (!CodePattern.IsMatch(submodule.Code))
                throw new InvalidOperationException(
                    $"Invalid submodule code '{submodule.Code}' in '{moduleName}'.");
            if (string.IsNullOrWhiteSpace(submodule.Name))
                throw new InvalidOperationException(
                    $"Submodule '{submodule.Code}' in '{moduleName}' must have a name.");
            if (submodule.RequiredPermissions is null ||
                submodule.RequiredPermissions.Any(string.IsNullOrWhiteSpace))
                throw new InvalidOperationException(
                    $"Submodule '{submodule.Code}' in '{moduleName}' has invalid permissions.");
            if (submodule.EntryPath is not null &&
                (!submodule.EntryPath.StartsWith("/", StringComparison.Ordinal) ||
                 submodule.EntryPath.StartsWith("//", StringComparison.Ordinal)))
                throw new InvalidOperationException(
                    $"Submodule '{submodule.Code}' in '{moduleName}' has an invalid entry path.");
        }

        var duplicatePermissions = definition.Submodules
            .SelectMany(submodule => submodule.RequiredPermissions)
            .GroupBy(permission => permission, StringComparer.Ordinal)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToArray();
        if (duplicatePermissions.Length > 0)
            throw new InvalidOperationException(
                $"Permissions may belong to only one submodule in '{moduleName}': {string.Join(", ", duplicatePermissions)}.");
    }

    private static void ValidateDependencies(ModuleDefinition definition, string moduleName)
    {
        if (definition.RequiredModuleDependencies is null)
            throw new InvalidOperationException($"Module '{moduleName}' must provide required module dependencies.");
        if (definition.OptionalModuleDependencies is null)
            throw new InvalidOperationException($"Module '{moduleName}' must provide optional module dependencies.");

        ValidateDependencyCollection(definition.RequiredModuleDependencies, definition, moduleName, "required");
        ValidateDependencyCollection(definition.OptionalModuleDependencies, definition, moduleName, "optional");

        var overlap = definition.RequiredModuleDependencies
            .Intersect(definition.OptionalModuleDependencies, StringComparer.OrdinalIgnoreCase)
            .ToArray();
        if (overlap.Length > 0)
            throw new InvalidOperationException(
                $"Module '{moduleName}' lists dependencies as both required and optional: {string.Join(", ", overlap)}.");
    }

    private static void ValidateDependencyCollection(
        IReadOnlyList<string> dependencies,
        ModuleDefinition definition,
        string moduleName,
        string dependencyKind)
    {
        if (dependencies.Any(string.IsNullOrWhiteSpace))
            throw new InvalidOperationException(
                $"Module '{moduleName}' has an invalid {dependencyKind} module dependency.");

        var invalid = dependencies
            .Where(dependency => !CodePattern.IsMatch(dependency))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        if (invalid.Length > 0)
            throw new InvalidOperationException(
                $"Module '{moduleName}' has invalid {dependencyKind} module dependency codes: {string.Join(", ", invalid)}.");

        var duplicates = dependencies
            .GroupBy(dependency => dependency, StringComparer.OrdinalIgnoreCase)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToArray();
        if (duplicates.Length > 0)
            throw new InvalidOperationException(
                $"Module '{moduleName}' has duplicate {dependencyKind} module dependencies: {string.Join(", ", duplicates)}.");

        if (dependencies.Contains(definition.Code, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException(
                $"Module '{moduleName}' cannot depend on itself ('{definition.Code}').");
    }

    private static List<IModule> BuildLifecycleOrder(
        IReadOnlyList<IModule> modules,
        IReadOnlyList<ModuleDefinition> definitions)
    {
        var indexByCode = definitions
            .Select((definition, index) => (definition.Code, index))
            .ToDictionary(item => item.Code, item => item.index, StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            var missing = definition.RequiredModuleDependencies
                .Where(dependency => !indexByCode.ContainsKey(dependency))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
            if (missing.Length > 0)
                throw new InvalidOperationException(
                    $"Module '{definition.Name}' ({definition.Code}) is missing required module dependencies: {string.Join(", ", missing)}.");
        }

        var outgoing = Enumerable.Range(0, definitions.Count)
            .Select(_ => new List<int>())
            .ToArray();
        var indegree = new int[definitions.Count];

        for (var moduleIndex = 0; moduleIndex < definitions.Count; moduleIndex++)
        {
            var definition = definitions[moduleIndex];
            var installedDependencies = definition.RequiredModuleDependencies
                .Concat(definition.OptionalModuleDependencies.Where(indexByCode.ContainsKey))
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var dependencyCode in installedDependencies)
            {
                var dependencyIndex = indexByCode[dependencyCode];
                outgoing[dependencyIndex].Add(moduleIndex);
                indegree[moduleIndex]++;
            }
        }

        var orderedIndexes = new List<int>(definitions.Count);
        var emitted = new bool[definitions.Count];

        while (orderedIndexes.Count < definitions.Count)
        {
            var next = -1;
            for (var index = 0; index < definitions.Count; index++)
            {
                if (!emitted[index] && indegree[index] == 0)
                {
                    next = index;
                    break;
                }
            }

            if (next < 0)
            {
                var cyclicCodes = Enumerable.Range(0, definitions.Count)
                    .Where(index => !emitted[index])
                    .Select(index => definitions[index].Code)
                    .ToArray();
                throw new InvalidOperationException(
                    $"Module dependency cycle detected among: {string.Join(", ", cyclicCodes)}.");
            }

            emitted[next] = true;
            orderedIndexes.Add(next);
            foreach (var dependentIndex in outgoing[next])
                indegree[dependentIndex]--;
        }

        return orderedIndexes.Select(index => modules[index]).ToList();
    }

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        foreach (var module in _lifecycleModules)
            module.RegisterServices(services, configuration);
    }

    /// <summary>
    /// Validates the standardized module migration switches for every installed
    /// module before any module is allowed to mutate its database. Without this
    /// preflight, a malformed setting on a later module could be discovered only
    /// after earlier modules had already applied migrations.
    /// </summary>
    public void ValidateMigrationConfiguration(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        foreach (var module in _lifecycleModules)
            _ = ModuleMigrationSettings.ShouldApplyMigrations(configuration, module.Name);
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        foreach (var module in _lifecycleModules)
            module.MapEndpoints(endpoints);
    }

    public async Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        foreach (var module in _lifecycleModules)
            await module.MigrateAsync(services, cancellationToken).ConfigureAwait(false);
    }

    public async Task<IReadOnlyDictionary<string, IReadOnlyList<string>>> GetPendingMigrationsAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(services);

        var pending = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase);
        foreach (var module in _lifecycleModules)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var migrations = await module
                .GetPendingMigrationsAsync(services, cancellationToken)
                .ConfigureAwait(false);
            if (migrations.Count > 0)
                pending[module.Name] = migrations;
        }

        return pending;
    }

    public async Task EnsureSchemaCompatibilityAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        var pending = await GetPendingMigrationsAsync(services, cancellationToken).ConfigureAwait(false);
        if (pending.Count == 0)
            return;

        var summary = string.Join(
            "; ",
            pending.Select(entry => $"{entry.Key}: {string.Join(", ", entry.Value)}"));
        throw new InvalidOperationException(
            $"Database schema is not compatible with the installed modules. Pending migrations: {summary}");
    }

    public void ConfigureEarlyApplication(WebApplication app)
    {
        foreach (var module in _lifecycleModules)
            module.ConfigureEarlyApplication(app);
    }

    public void ConfigureApplication(WebApplication app)
    {
        foreach (var module in _lifecycleModules)
            module.ConfigureApplication(app);
    }

    public async Task InitializeAsync(WebApplication app, CancellationToken cancellationToken = default)
    {
        foreach (var module in _lifecycleModules)
            await module.InitializeAsync(app, cancellationToken).ConfigureAwait(false);
    }
}
