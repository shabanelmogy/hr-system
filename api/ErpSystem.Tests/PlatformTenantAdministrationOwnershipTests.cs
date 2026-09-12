using System.Reflection;
using ErpSystem.Modules.HR.Application.Common.Errors;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Services;
using ErpSystem.Modules.HR.Infrastructure;
using ErpSystem.Modules.HR.Infrastructure.Features.Tenancy.Services;
using ErpSystem.Modules.HR.Presentation.Features.Tenancy.V1;
using ErpSystem.Modules.Platform.Application;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PlatformAdmin = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration;

namespace ErpSystem.Tests;

public sealed class PlatformTenantAdministrationOwnershipTests
{
    [Fact]
    public void PlatformTenantAdministrationAssemblies_DoNotReferenceHr()
    {
        var contractsReferences = typeof(PlatformAdmin.ITenantManagementOrchestrator).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();
        var applicationReferences = ErpSystem.Modules.Platform.Application.AssemblyReference.Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null)
            .ToArray();

        Assert.DoesNotContain(contractsReferences, name =>
            name!.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal));
        Assert.DoesNotContain(applicationReferences, name =>
            name!.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal));
    }

    [Fact]
    public void LegacyHrServices_AreExplicitStorageAdapters_NotPresentationServices()
    {
        Assert.False(typeof(ITenantManagementService).IsAssignableFrom(typeof(TenantManagementService)));
        Assert.False(typeof(ITenantAdminService).IsAssignableFrom(typeof(TenantAdminService)));
        Assert.True(typeof(PlatformAdmin.ITenantManagementAdapter)
            .IsAssignableFrom(typeof(LegacyHrTenantManagementAdapter)));
        Assert.True(typeof(PlatformAdmin.ITenantAdministratorAdapter)
            .IsAssignableFrom(typeof(LegacyHrTenantAdministratorAdapter)));
        Assert.True(typeof(ITenantManagementService)
            .IsAssignableFrom(typeof(PlatformTenantManagementCompatibilityService)));
        Assert.True(typeof(ITenantAdminService)
            .IsAssignableFrom(typeof(PlatformTenantAdministratorCompatibilityService)));

        Assert.Contains(
            typeof(PlatformAdmin.ITenantAdministrationPolicy),
            ConstructorDependencies(typeof(TenantManagementService)));
        Assert.Contains(
            typeof(PlatformAdmin.ITenantAdministrationPolicy),
            ConstructorDependencies(typeof(TenantAdminService)));
    }

    [Fact]
    public void PlatformPolicy_PreservesLegacyIdentifierTenantIdAndSeatRules()
    {
        var services = new ServiceCollection();
        services.AddPlatformApplication();
        using var provider = services.BuildServiceProvider();
        var policy = provider.GetRequiredService<PlatformAdmin.ITenantAdministrationPolicy>();

        Assert.Equal("tenant-code", policy.NormalizeIdentifier("  tenant-code  "));
        Assert.Equal(
            ["tenant-b", "tenant-a"],
            policy.NormalizeTenantIds(["tenant-b", "tenant-a", "tenant-b"]));

        Assert.True(policy.CanSetSeatLimits(2, 5, 2, 5));
        Assert.False(policy.CanSetSeatLimits(1, 5, 2, 5));
        Assert.False(policy.CanSetSeatLimits(2, 4, 2, 5));
        Assert.True(policy.HasAdministratorSeat(2, 1));
        Assert.False(policy.HasAdministratorSeat(2, 2));
    }

    [Fact]
    public void HrComposition_RoutesWireServicesThroughPlatformAndRegistersLegacyAdapterPorts()
    {
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Server=(localdb)\\mssqllocaldb;Database=TenantAdministrationOwnership;Trusted_Connection=True;"
            })
            .Build();

        services.AddInfrastructure(configuration);

        AssertRegistration<ITenantManagementService, PlatformTenantManagementCompatibilityService>(services);
        AssertRegistration<ITenantAdminService, PlatformTenantAdministratorCompatibilityService>(services);
        AssertRegistration<PlatformAdmin.ITenantManagementAdapter, LegacyHrTenantManagementAdapter>(services);
        AssertRegistration<PlatformAdmin.ITenantAdministratorAdapter, LegacyHrTenantAdministratorAdapter>(services);
    }

    [Fact]
    public async Task PlatformOrchestrators_PreserveTenantAndAdministratorRequestsAndResultIdentity()
    {
        var tenantAdapter = new RecordingTenantManagementAdapter();
        var adminAdapter = new RecordingTenantAdministratorAdapter();
        var services = new ServiceCollection();
        services.AddSingleton<PlatformAdmin.ITenantManagementAdapter>(tenantAdapter);
        services.AddSingleton<PlatformAdmin.ITenantAdministratorAdapter>(adminAdapter);
        services.AddPlatformApplication();
        using var provider = services.BuildServiceProvider();
        var tenantOrchestrator = provider.GetRequiredService<PlatformAdmin.ITenantManagementOrchestrator>();
        var adminOrchestrator = provider.GetRequiredService<PlatformAdmin.ITenantAdministratorOrchestrator>();
        var tenantRequest = new PlatformAdmin.TenantManagementRequest(
            "tenant-code",
            "Tenant",
            true,
            "active",
            DateTime.UnixEpoch,
            null,
            "Plan",
            2,
            20,
            "billing@example.com",
            "Contact",
            "+20",
            "Notes");
        var adminRequest = new PlatformAdmin.CreateTenantAdministratorRequest(
            "First",
            "Last",
            "administrator",
            "administrator@example.com",
            "password",
            ["tenant-1"],
            "tenant-1");

        var tenantResult = await tenantOrchestrator.CreateAsync(tenantRequest);
        var adminResult = await adminOrchestrator.CreateAsync(adminRequest);

        Assert.Same(tenantRequest, tenantAdapter.LastCreateRequest);
        Assert.Same(tenantAdapter.CreateResult, tenantResult);
        Assert.Same(adminRequest, adminAdapter.LastCreateRequest);
        Assert.Same(adminAdapter.CreateResult, adminResult);
    }

    [Fact]
    public async Task CompatibilityFacade_PreservesLegacyErrorCodeDescriptionAndClassification()
    {
        const string code = "Tenant.ConcurrencyConflict";
        const string description = "The tenant was changed by another request. Reload it and try again.";
        var service = new PlatformTenantManagementCompatibilityService(
            new FailingTenantManagementOrchestrator(new PlatformAdmin.TenantAdministrationError(
                code,
                description,
                PlatformAdmin.TenantAdministrationErrorType.Conflict)));

        var result = await service.GetAsync("tenant-1");

        Assert.True(result.IsFailure);
        Assert.Equal(code, result.Error.Code);
        Assert.Equal(description, result.Error.Description);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);
    }

    [Fact]
    public void ExistingTenantControllers_RetainHrWireContractsAndRoutes()
    {
        Assert.Equal(
            [typeof(ITenantManagementService)],
            ConstructorDependencies(typeof(TenantsController)));
        Assert.Equal(
            [typeof(ITenantAdminService)],
            ConstructorDependencies(typeof(TenantAdminsController)));

        Assert.Equal(
            "api/v{version:apiVersion}/[controller]/[action]",
            typeof(TenantsController).GetCustomAttribute<RouteAttribute>()!.Template);
        Assert.Equal(
            "api/v{version:apiVersion}/[controller]/[action]",
            typeof(TenantAdminsController).GetCustomAttribute<RouteAttribute>()!.Template);
        Assert.Equal(
            "~/api/v{version:apiVersion}/tenants/archive/{id}",
            typeof(TenantsController).GetMethod(nameof(TenantsController.Archive))!
                .GetCustomAttribute<HttpPostAttribute>()!.Template);
        Assert.Equal(
            "~/api/v{version:apiVersion}/tenants/restore/{id}",
            typeof(TenantsController).GetMethod(nameof(TenantsController.Restore))!
                .GetCustomAttribute<HttpPostAttribute>()!.Template);
        Assert.Equal(
            "~/api/v{version:apiVersion}/tenantAdmins/restore/{id}",
            typeof(TenantAdminsController).GetMethod(nameof(TenantAdminsController.Restore))!
                .GetCustomAttribute<HttpPostAttribute>()!.Template);
    }

    private static Type[] ConstructorDependencies(Type type) =>
        type.GetConstructors().Single().GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

    private static void AssertRegistration<TService, TImplementation>(IServiceCollection services)
    {
        var descriptor = Assert.Single(services, descriptor => descriptor.ServiceType == typeof(TService));
        Assert.Equal(typeof(TImplementation), descriptor.ImplementationType);
    }

    private sealed class RecordingTenantManagementAdapter : PlatformAdmin.ITenantManagementAdapter
    {
        public PlatformAdmin.TenantManagementRequest? LastCreateRequest { get; private set; }

        public PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse> CreateResult { get; } =
            PlatformAdmin.TenantAdministrationResult.Failure<PlatformAdmin.TenantManagementResponse>(
                new PlatformAdmin.TenantAdministrationError(
                    "Tenant.Test",
                    "test",
                    PlatformAdmin.TenantAdministrationErrorType.Validation));

        public Task<PlatformAdmin.TenantAdministrationPage<PlatformAdmin.TenantManagementResponse>> GetPageAsync(
            PlatformAdmin.TenantAdministrationPageRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<IReadOnlyList<PlatformAdmin.TenantManagementResponse>> GetAllAsync(
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> GetAsync(
            string id,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> CreateAsync(
            PlatformAdmin.TenantManagementRequest request,
            CancellationToken cancellationToken = default)
        {
            LastCreateRequest = request;
            return Task.FromResult(CreateResult);
        }

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> UpdateAsync(
            string id,
            PlatformAdmin.TenantManagementRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> ArchiveAsync(
            string id,
            PlatformAdmin.ArchiveTenantRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> RestoreAsync(
            string id,
            PlatformAdmin.RestoreTenantRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class FailingTenantManagementOrchestrator(
        PlatformAdmin.TenantAdministrationError error) : PlatformAdmin.ITenantManagementOrchestrator
    {
        public Task<PlatformAdmin.TenantAdministrationPage<PlatformAdmin.TenantManagementResponse>> GetPageAsync(
            PlatformAdmin.TenantAdministrationPageRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<IReadOnlyList<PlatformAdmin.TenantManagementResponse>> GetAllAsync(
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> GetAsync(
            string id,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(PlatformAdmin.TenantAdministrationResult.Failure<PlatformAdmin.TenantManagementResponse>(error));

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> CreateAsync(
            PlatformAdmin.TenantManagementRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> UpdateAsync(
            string id,
            PlatformAdmin.TenantManagementRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> ArchiveAsync(
            string id,
            PlatformAdmin.ArchiveTenantRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantManagementResponse>> RestoreAsync(
            string id,
            PlatformAdmin.RestoreTenantRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class RecordingTenantAdministratorAdapter : PlatformAdmin.ITenantAdministratorAdapter
    {
        public PlatformAdmin.CreateTenantAdministratorRequest? LastCreateRequest { get; private set; }

        public PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantAdministratorResponse> CreateResult { get; } =
            PlatformAdmin.TenantAdministrationResult.Failure<PlatformAdmin.TenantAdministratorResponse>(
                new PlatformAdmin.TenantAdministrationError(
                    "TenantAdministrator.Test",
                    "test",
                    PlatformAdmin.TenantAdministrationErrorType.Validation));

        public Task<PlatformAdmin.TenantAdministrationPage<PlatformAdmin.TenantAdministratorResponse>> GetPageAsync(
            PlatformAdmin.TenantAdministrationPageRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<IReadOnlyList<PlatformAdmin.TenantAdministratorResponse>> GetAllAsync(
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantAdministratorResponse>> GetAsync(
            string id,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantAdministratorResponse>> CreateAsync(
            PlatformAdmin.CreateTenantAdministratorRequest request,
            CancellationToken cancellationToken = default)
        {
            LastCreateRequest = request;
            return Task.FromResult(CreateResult);
        }

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantAdministratorResponse>> UpdateAsync(
            string id,
            PlatformAdmin.UpdateTenantAdministratorRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult> ArchiveAsync(
            string id,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<PlatformAdmin.TenantAdministrationResult<PlatformAdmin.TenantAdministratorResponse>> RestoreAsync(
            string id,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }
}
