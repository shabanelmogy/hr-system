using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Presentation.Features.Tenancy.V1;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformTenantAdministrationOwnershipTests
{
    [Fact]
    public void TenantAdministrationControllers_AreSenderOnly()
    {
        Assert.Equal(
            [typeof(ISender)],
            Assert.Single(typeof(TenantsController).GetConstructors()).GetParameters()
                .Select(parameter => parameter.ParameterType));
        Assert.Equal(
            [typeof(ISender)],
            Assert.Single(typeof(TenantAdminsController).GetConstructors()).GetParameters()
                .Select(parameter => parameter.ParameterType));
    }

    [Fact]
    public void TenantAdministrationRuntimeContracts_AreApplicationOwned()
    {
        var applicationAssembly = typeof(GetTenantQuery).Assembly;

        Assert.Equal("ErpSystem.Modules.Platform.Application", applicationAssembly.GetName().Name);
        Assert.Same(applicationAssembly, typeof(GetTenantAdministratorQuery).Assembly);
        Assert.Same(applicationAssembly, typeof(ITenantAdministrationPolicy).Assembly);
        Assert.Same(applicationAssembly, typeof(TenantManagementRequest).Assembly);

        var contractsAssembly = typeof(ErpSystem.Modules.Platform.Contracts.AssemblyReference).Assembly;
        Assert.DoesNotContain(
            contractsAssembly.GetTypes(),
            type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.Tenancy.Administration",
                StringComparison.Ordinal));
    }

    [Fact]
    public void TenantManagementContractContainsTenantOwnedEntitlements() => Assert.NotNull(typeof(TenantManagementRequest).GetProperty(nameof(TenantManagementRequest.Entitlements)));
}
