using System.Reflection;
using Asp.Versioning;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Presentation.Features.Modules.V1;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformModuleCatalogOwnershipTests
{
    [Fact]
    public void PlatformPresentation_OwnsExistingModulesRoutesAndAuthorization()
    {
        var controller = typeof(ModulesController);

        Assert.Equal("1.0", controller.GetCustomAttribute<ApiVersionAttribute>()?.Versions.Single().ToString());
        Assert.Equal("api/v{version:apiVersion}/modules", controller.GetCustomAttribute<RouteAttribute>()?.Template);
        Assert.NotNull(controller.GetCustomAttribute<AuthorizeAttribute>());

        var installed = controller.GetMethod(nameof(ModulesController.GetInstalled))!;
        var tenantEntitlements = controller.GetMethod(nameof(ModulesController.GetTenantEntitlements))!;
        var accessible = controller.GetMethod(nameof(ModulesController.GetAccessible))!;
        Assert.Equal("installed", Assert.Single(installed.GetCustomAttributes<HttpGetAttribute>()).Template);
        Assert.Equal("super_admin", installed.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
        Assert.Equal("tenant-entitlements", Assert.Single(tenantEntitlements.GetCustomAttributes<HttpGetAttribute>()).Template);
        Assert.Equal("super_admin", tenantEntitlements.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
        Assert.Equal("accessible", Assert.Single(accessible.GetCustomAttributes<HttpGetAttribute>()).Template);

    }

    [Fact]
    public async Task PlatformPolicy_OwnsInstalledAccessibilityAndEntitlementValidation()
    {
        var source = new RecordingEntitlementSource
        {
            IsSuperAdmin = true
        };
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(new ModuleCatalog([
            new PlatformModule(),
            new CatalogModule(new ModuleDefinition("hr", "HR", [], IsDefault: true)),
            new CatalogModule(new ModuleDefinition("acc", "Accounting", [])),
            new CatalogModule(new ModuleDefinition("reference-data", "ReferenceData", [
                new SubmoduleDefinition("addresses", "Addresses", ["Addresses:View"]),
                new SubmoduleDefinition(
                    "geography",
                    "Geography",
                    ["Countries:View"],
                    PermissionAccessMode: PermissionAccessMode.Global)
            ], IsDefault: true))
        ]));
        services.AddSingleton<ITenantModuleEntitlementSource>(source);
        services.AddSingleton<ICurrentExecutionContext>(new TestExecutionContext("super-1", "tenant-1"));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var policy = provider.GetRequiredService<IModuleCatalogPolicy>();
        var installed = policy.GetInstalled();
        var tenantEntitlementCatalog = policy.GetTenantEntitlementCatalog();
        var accessible = await policy.GetAccessibleAsync("super-1", "tenant-1");

        Assert.Contains(installed, module => module.Code == "hr");
        Assert.Contains(installed, module => module.Code == "acc");
        Assert.Contains(installed.Single(module => module.Code == "reference-data").Submodules,
            submodule => submodule.Code == "geography");
        var referenceDataEntitlements = tenantEntitlementCatalog.Single(module => module.Code == "reference-data");
        Assert.Contains(referenceDataEntitlements.Submodules, submodule => submodule.Code == "addresses");
        Assert.DoesNotContain(referenceDataEntitlements.Submodules, submodule => submodule.Code == "geography");
        var defaults = policy.GetDefaultEntitlements();
        var defaultReferenceData = Assert.Single(defaults, item => item.ModuleCode == "reference-data");
        Assert.Equal(["addresses"], defaultReferenceData.SubmoduleCodes);
        Assert.DoesNotContain(defaults, item =>
            item.ModuleCode == "reference-data" &&
            item.SubmoduleCodes?.Contains("geography", StringComparer.OrdinalIgnoreCase) == true);
        Assert.DoesNotContain(installed, module => module.Code == "platform");
        Assert.DoesNotContain(defaults, item => item.ModuleCode == "platform");
        Assert.DoesNotContain(accessible, module => module.Code == "platform");
        Assert.Contains(accessible, module => module.Code == "hr");
        Assert.Contains(accessible, module => module.Code == "acc");
        Assert.False(policy.IsValidEntitlement(
            [new TenantModuleEntitlementRequest("platform", [])],
            out var invalidCode));
        Assert.Equal("platform", invalidCode);
        Assert.False(policy.IsValidEntitlement(
            [new TenantModuleEntitlementRequest("reference-data", ["geography"])],
            out invalidCode));
        Assert.Equal("reference-data:geography", invalidCode);
        Assert.True(policy.IsValidEntitlement(
            [new TenantModuleEntitlementRequest("reference-data", ["addresses"])],
            out _));
        Assert.True(policy.IsValidEntitlement(
            [new TenantModuleEntitlementRequest("acc", [])],
            out _));

        var platformReferences = typeof(IModuleCatalogPolicy).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(platformReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);

        Assert.Equal("ErpSystem.Modules.Platform.Application", typeof(IModuleCatalogPolicy).Assembly.GetName().Name);
        Assert.Same(typeof(IModuleCatalogPolicy).Assembly, typeof(ModuleCatalogItem).Assembly);
        Assert.DoesNotContain(
            typeof(ErpSystem.Modules.Platform.Contracts.AssemblyReference).Assembly.GetTypes(),
            type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.Modules",
                StringComparison.Ordinal));
    }

    [Fact]
    public async Task PlatformQueries_UseExecutionContextAndPreserveMissingTenantUnauthorizedSignal()
    {
        var policy = new RecordingPlatformCatalogPolicy();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<IModuleCatalogPolicy>(policy);
        services.AddSingleton<ICurrentExecutionContext>(new TestExecutionContext("user-1", "tenant-1"));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var result = await provider.GetRequiredService<ISender>().Send(new GetAccessibleModulesQuery());

        Assert.NotNull(result);
        Assert.Equal(("user-1", "tenant-1"), policy.LastScope);

        var noTenantServices = new ServiceCollection();
        noTenantServices.AddLogging();
        noTenantServices.AddSingleton<IModuleCatalogPolicy>(policy);
        noTenantServices.AddSingleton<ICurrentExecutionContext>(new TestExecutionContext("user-1", null));
        noTenantServices.AddPlatformApplication();
        using var noTenantProvider = noTenantServices.BuildServiceProvider();

        Assert.Null(await noTenantProvider.GetRequiredService<ISender>().Send(new GetAccessibleModulesQuery()));
    }

    private sealed class RecordingPlatformCatalogPolicy : IModuleCatalogPolicy
    {
        private static readonly ModuleCatalogItem Module = new(
            "hr",
            "HR",
            [new ModuleSubmoduleCatalogItem("basic-data", "Basic data", ["Countries:View"], "/apps/hr/basic-data")],
            true);

        public (string UserId, string TenantId)? LastScope { get; private set; }

        public IReadOnlyList<ModuleCatalogItem> GetInstalled() => [Module];

        public IReadOnlyList<ModuleCatalogItem> GetTenantEntitlementCatalog() => [Module];

        public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() =>
            [new("hr", ["basic-data"])];

        public Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            LastScope = (userId, tenantId);
            return Task.FromResult<IReadOnlyList<ModuleCatalogItem>>([Module]);
        }

        public IReadOnlySet<string> GetKnownPermissions() =>
            new HashSet<string>(["Countries:View"], StringComparer.Ordinal);

        public IReadOnlySet<string> GetTenantAssignablePermissions() =>
            new HashSet<string>(["Countries:View"], StringComparer.Ordinal);

        public bool TryResolvePermission(
            string permission,
            out ModulePermissionCatalogItem resolvedPermission)
        {
            resolvedPermission = new ModulePermissionCatalogItem(
                permission,
                "hr",
                "basic-data",
                RequiresTenantScope: true,
                RequiresTenantEntitlement: true);
            return true;
        }

        public Task<bool> IsSuperAdminAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);

        public bool IsValidEntitlement(
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            out string? invalidCode)
        {
            invalidCode = null;
            return true;
        }
    }

    private sealed class RecordingEntitlementSource : ITenantModuleEntitlementSource
    {
        public bool IsSuperAdmin { get; init; }

        public Task ApplyAsync(
            string tenantId,
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<bool> HasAccessAsync(
            string tenantId,
            string moduleCode,
            string submoduleCode,
            CancellationToken cancellationToken = default) => Task.FromResult(true);

        public Task<IReadOnlyList<TenantModuleEntitlementResponse>> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<TenantModuleEntitlementResponse>>([]);

        public Task<bool> UserHasPermissionAsync(
            string userId,
            string tenantId,
            string permission,
            CancellationToken cancellationToken = default) => Task.FromResult(true);

        public Task<IReadOnlySet<string>> GetUserPermissionsAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlySet<string>>(new HashSet<string>(StringComparer.Ordinal));

        public Task<bool> IsSuperAdminAsync(
            string userId,
            CancellationToken cancellationToken = default) => Task.FromResult(IsSuperAdmin);
    }

    private sealed class TestExecutionContext(string? userId, string? tenantId) : ICurrentExecutionContext
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId => null;
    }

    private sealed class CatalogModule(ModuleDefinition definition) : IModule
    {
        public string Name => definition.Name;
        public ModuleDefinition Definition => definition;

        public void RegisterServices(
            IServiceCollection services,
            Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
        }

        public Task MigrateAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
            IServiceProvider services,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<string>>([]);
    }
}

