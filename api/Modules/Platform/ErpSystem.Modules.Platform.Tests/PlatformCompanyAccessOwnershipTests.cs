using System.Reflection;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Contracts.CompanyAccess;
using ErpSystem.Modules.Platform.Application.TenantMembership;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformCompanyAccessOwnershipTests
{
    [Fact]
    public void CompanyAccessOwnership_IsContainedWithinPlatformBoundaries()
    {
        var applicationAssembly = typeof(ICompanyAccessService).Assembly;
        var contractsAssembly = typeof(ICompanyGeographySource).Assembly;

        Assert.Equal("ErpSystem.Modules.Platform.Application", applicationAssembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Contracts", contractsAssembly.GetName().Name);
        Assert.Same(applicationAssembly, typeof(ICompanyAccessSource).Assembly);
        Assert.Same(applicationAssembly, typeof(CompanyAccessSnapshot).Assembly);
        Assert.Same(applicationAssembly, typeof(CompanyAccessOption).Assembly);

        var platformApplicationReferences = applicationAssembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformContractsReferences = contractsAssembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);

        var publicCompanyAccessTypes = contractsAssembly.GetTypes()
            .Where(type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.CompanyAccess",
                StringComparison.Ordinal))
            .ToArray();
        Assert.Equal([typeof(ICompanyGeographySource)], publicCompanyAccessTypes);

        Assert.Equal(
            [typeof(ISender)],
            typeof(AuthController).GetConstructors().Single().GetParameters()
                .Select(parameter => parameter.ParameterType));

        Assert.Equal(
            "ErpSystem.Modules.Platform.Infrastructure",
            typeof(PlatformUserCompanyAccess).Assembly.GetName().Name);
    }

    [Fact]
    public async Task PlatformApplication_OwnsActiveFilteringAndPreservesPersistenceOrdering()
    {
        var source = new RecordingCompanyAccessSource
        {
            Snapshots =
            [
                new(4, "D", "افتراضي", "Default", true, true),
                new(3, "X", "معطل", "Disabled", true, false),
                new(1, "A", "ألف", "Alpha", false, true),
                new(2, "B", "باء", "Beta", false, true)
            ]
        };
        var services = new ServiceCollection();
        services.AddSingleton<ICompanyAccessSource>(source);
        services.AddSingleton<ITenantMembershipSource>(new RecordingTenantMembershipSource
        {
            Snapshots = [EligibleMembership("tenant-1")]
        });
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ICompanyAccessService>();

        var companies = await service.GetAvailableCompaniesAsync("user-1", "tenant-1");

        Assert.Equal([4, 1, 2], companies.Select(company => company.Id));
        Assert.Equal(("user-1", "tenant-1"), source.LastScope);
    }

    [Fact]
    public async Task PlatformApplication_GetAvailableCompany_RequiresActiveTenantMembershipAndActiveCompany()
    {
        var source = new RecordingCompanyAccessSource
        {
            Snapshots = [new(7, "C7", "شركة 7", "Company 7", true, true)]
        };
        var memberships = new RecordingTenantMembershipSource();
        var services = new ServiceCollection();
        services.AddSingleton<ICompanyAccessSource>(source);
        services.AddSingleton<ITenantMembershipSource>(memberships);
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ICompanyAccessService>();

        Assert.Null(await service.GetAvailableCompanyAsync("user-1", "tenant-1", 7));
        Assert.Equal(0, source.GetCalls);

        memberships.Snapshots = [EligibleMembership("tenant-1")];
        var company = await service.GetAvailableCompanyAsync("user-1", "tenant-1", 7);
        Assert.NotNull(company);
        Assert.Equal("C7", company!.CompanyCode);

        source.Snapshots = [new(7, "C7", "شركة 7", "Company 7", true, false)];
        Assert.Null(await service.GetAvailableCompanyAsync("user-1", "tenant-1", 7));
    }

    private sealed class RecordingCompanyAccessSource : ICompanyAccessSource
    {
        public IReadOnlyList<CompanyAccessSnapshot> Snapshots { get; set; } = [];
        public (string UserId, string TenantId)? LastScope { get; private set; }
        public int GetCalls { get; private set; }

        public Task<IReadOnlyList<CompanyAccessSnapshot>> GetAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            LastScope = (userId, tenantId);
            GetCalls++;
            return Task.FromResult(Snapshots);
        }
    }

    private sealed class RecordingTenantMembershipSource : ITenantMembershipSource
    {
        public IReadOnlyList<TenantMembershipSnapshot> Snapshots { get; set; } = [];

        public Task<IReadOnlyList<TenantMembershipSnapshot>> GetAsync(
            string userId,
            CancellationToken cancellationToken = default) => Task.FromResult(Snapshots);
    }

    private static TenantMembershipSnapshot EligibleMembership(string tenantId) =>
        new(tenantId, tenantId, tenantId, true, true, TenantSubscriptionStatus.Active);

}

