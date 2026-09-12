using System.Reflection;
using Asp.Versioning;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Contracts.Entitlements;
using ErpSystem.Modules.Platform.Contracts.Modules;
using ErpSystem.Modules.Platform.Presentation.Features.Modules.V1;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

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
        var accessible = controller.GetMethod(nameof(ModulesController.GetAccessible))!;
        Assert.Equal("installed", Assert.Single(installed.GetCustomAttributes<HttpGetAttribute>()).Template);
        Assert.Equal("super_admin", installed.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
        Assert.Equal("accessible", Assert.Single(accessible.GetCustomAttributes<HttpGetAttribute>()).Template);

        Assert.Null(typeof(ErpSystem.Modules.HR.Presentation.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Presentation.Features.Tenancy.V1.ModulesController"));
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
        services.AddSingleton(new ModuleCatalog(ErpSystem.Api.Modules.ErpModuleRegistry.Create()));
        services.AddSingleton<ITenantModuleEntitlementSource>(source);
        services.AddSingleton<ICurrentExecutionContext>(new TestExecutionContext("super-1", "tenant-1"));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var policy = provider.GetRequiredService<IModuleCatalogPolicy>();
        var installed = policy.GetInstalled();
        var accessible = await policy.GetAccessibleAsync("super-1", "tenant-1");

        Assert.Contains(installed, module => module.Code == "hr");
        Assert.Contains(installed, module => module.Code == "acc");
        Assert.DoesNotContain(installed, module => module.Code == "platform");
        Assert.DoesNotContain(policy.GetDefaultEntitlements(), item => item.ModuleCode == "platform");
        Assert.DoesNotContain(accessible, module => module.Code == "platform");
        Assert.Contains(accessible, module => module.Code == "hr");
        Assert.Contains(accessible, module => module.Code == "acc");
        Assert.False(policy.IsValidEntitlement(
            [new TenantModuleEntitlementRequest("platform", [])],
            out var invalidCode));
        Assert.Equal("platform", invalidCode);
        Assert.True(policy.IsValidEntitlement(
            [new TenantModuleEntitlementRequest("acc", [])],
            out _));

        var platformReferences = typeof(IModuleCatalogPolicy).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(platformReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.Null(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Features.Tenancy.PlatformCompatibility.PlatformModuleCatalogSource"));
        Assert.Null(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Features.Tenancy.PlatformCompatibility.PlatformModuleCatalogAdapter"));
        Assert.Null(typeof(ErpSystem.Modules.HR.HRModule).Assembly.GetType(
            "ErpSystem.Modules.HR.HrModuleCatalogService"));
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
        var result = await provider.GetRequiredService<IModuleCatalogQueries>().GetAccessibleAsync();

        Assert.NotNull(result);
        Assert.Equal(("user-1", "tenant-1"), policy.LastScope);

        var noTenantServices = new ServiceCollection();
        noTenantServices.AddLogging();
        noTenantServices.AddSingleton<IModuleCatalogPolicy>(policy);
        noTenantServices.AddSingleton<ICurrentExecutionContext>(new TestExecutionContext("user-1", null));
        noTenantServices.AddPlatformApplication();
        using var noTenantProvider = noTenantServices.BuildServiceProvider();

        Assert.Null(await noTenantProvider.GetRequiredService<IModuleCatalogQueries>().GetAccessibleAsync());
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

        public bool TryResolvePermission(string permission, out string moduleCode, out string submoduleCode)
        {
            moduleCode = "hr";
            submoduleCode = "basic-data";
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
}
