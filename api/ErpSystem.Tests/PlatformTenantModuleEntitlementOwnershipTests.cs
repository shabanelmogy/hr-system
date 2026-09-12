using ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;
using ErpSystem.Modules.HR.Application.Features.Tenancy.PlatformCompatibility;
using ErpSystem.Modules.Platform.Application;
using PlatformEntitlementService = ErpSystem.Modules.Platform.Application.Entitlements.ITenantModuleEntitlementService;
using Microsoft.Extensions.DependencyInjection;
using HrEntitlementRequest = ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts.TenantModuleEntitlementRequest;
using HrEntitlementResponse = ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts.TenantModuleEntitlementResponse;
using PlatformEntitlementSource = ErpSystem.Modules.Platform.Contracts.Entitlements.ITenantModuleEntitlementSource;
using PlatformEntitlementRequest = ErpSystem.Modules.Platform.Contracts.Entitlements.TenantModuleEntitlementRequest;
using PlatformEntitlementResponse = ErpSystem.Modules.Platform.Contracts.Entitlements.TenantModuleEntitlementResponse;

namespace ErpSystem.Tests;

public sealed class PlatformTenantModuleEntitlementOwnershipTests
{
    [Fact]
    public void TenantManagementContracts_ExposePlatformOwnedEntitlementTypes()
    {
        var requestProperty = typeof(TenantManagementRequest).GetProperty(nameof(TenantManagementRequest.Entitlements));
        var responseProperty = typeof(TenantManagementResponse).GetProperty(nameof(TenantManagementResponse.Entitlements));

        Assert.NotNull(requestProperty);
        Assert.NotNull(responseProperty);
        Assert.Equal(typeof(IReadOnlyList<PlatformEntitlementRequest>), requestProperty!.PropertyType);
        Assert.Equal(typeof(IReadOnlyList<PlatformEntitlementResponse>), responseProperty!.PropertyType);
    }

    [Fact]
    public void PlatformEntitlementOwnership_DoesNotCreatePlatformToHrReference()
    {
        var platformContractsReferences = typeof(PlatformEntitlementSource).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformApplicationReferences = typeof(PlatformEntitlementService).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.Null(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Features.Tenancy.PlatformCompatibility.PlatformTenantModuleEntitlementSource"));
    }

    [Fact]
    public void HrTenantManagementDtoMappings_RemainAvailableWithoutAPlatformSourceAdapter()
    {
        PlatformEntitlementRequest[] request =
        [
            new("hr", ["basic-data", "recruitment"])
        ];

        var applied = Assert.Single(request.ToHrEntitlements());
        Assert.Equal("hr", applied.ModuleCode);
        Assert.Equal(["basic-data", "recruitment"], applied.SubmoduleCodes);

        var response = Assert.Single(new[]
        {
            new HrEntitlementResponse("hr", ["basic-data"])
        }.ToPlatformEntitlements());
        Assert.Equal("hr", response.ModuleCode);
        Assert.Equal(["basic-data"], response.SubmoduleCodes);
    }

    [Fact]
    public async Task PlatformApplicationService_DelegatesToPlatformContractSource()
    {
        var source = new RecordingPlatformEntitlementSource();
        var services = new ServiceCollection();
        services.AddSingleton<PlatformEntitlementSource>(source);
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        var service = provider.GetRequiredService<PlatformEntitlementService>();
        PlatformEntitlementRequest[] request = [new("hr", ["basic-data"])];

        await service.ApplyAsync("tenant-1", request);
        var response = Assert.Single(await service.GetAsync("tenant-1"));

        Assert.Equal("tenant-1", source.AppliedTenantId);
        Assert.Equal("hr", response.ModuleCode);
        Assert.True(await service.HasAccessAsync("tenant-1", "hr", "basic-data"));
        Assert.True(await service.UserHasPermissionAsync("user-1", "tenant-1", "Countries:View"));
        Assert.Contains("Countries:View", await service.GetUserPermissionsAsync("user-1", "tenant-1"));
        Assert.True(await service.IsSuperAdminAsync("super-1"));
    }

    private sealed class RecordingPlatformEntitlementSource : PlatformEntitlementSource
    {
        public string? AppliedTenantId { get; private set; }

        public Task ApplyAsync(
            string tenantId,
            IReadOnlyCollection<PlatformEntitlementRequest> entitlements,
            CancellationToken cancellationToken = default)
        {
            AppliedTenantId = tenantId;
            return Task.CompletedTask;
        }

        public Task<bool> HasAccessAsync(
            string tenantId,
            string moduleCode,
            string submoduleCode,
            CancellationToken cancellationToken = default) => Task.FromResult(true);

        public Task<IReadOnlyList<PlatformEntitlementResponse>> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<PlatformEntitlementResponse>>(
                [new PlatformEntitlementResponse("hr", ["basic-data"])]);

        public Task<bool> UserHasPermissionAsync(
            string userId,
            string tenantId,
            string permission,
            CancellationToken cancellationToken = default) => Task.FromResult(true);

        public Task<IReadOnlySet<string>> GetUserPermissionsAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlySet<string>>(new HashSet<string>(["Countries:View"], StringComparer.Ordinal));

        public Task<bool> IsSuperAdminAsync(
            string userId,
            CancellationToken cancellationToken = default) => Task.FromResult(true);
    }
}
