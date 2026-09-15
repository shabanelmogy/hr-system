using ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using PlatformTenantAccessService = ErpSystem.Modules.Platform.Application.Tenancy.ITenantAccessService;
using PlatformSubscriptionStatus = ErpSystem.Modules.Platform.Application.Tenancy.TenantSubscriptionStatus;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformTenantAccessOwnershipTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 9, 9, 20, 0, 0, TimeSpan.Zero);

    [Fact]
    public void TenantAccessOwnership_KeepsRuntimeTypesInApplicationAndEndpointMetadataInContracts()
    {
        var applicationAssembly = typeof(PlatformTenantAccessService).Assembly;
        var contractsAssembly = typeof(AllowTenantReadOnlyAttribute).Assembly;

        Assert.Equal("ErpSystem.Modules.Platform.Application", applicationAssembly.GetName().Name);
        Assert.Equal("ErpSystem.Modules.Platform.Contracts", contractsAssembly.GetName().Name);
        Assert.Same(applicationAssembly, typeof(ITenantAccessSource).Assembly);
        Assert.Same(applicationAssembly, typeof(TenantAccessSnapshot).Assembly);
        Assert.Same(applicationAssembly, typeof(TenantAccessResponse).Assembly);
        Assert.Same(applicationAssembly, typeof(TenantSubscriptionStatus).Assembly);

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

        var publicTenancyTypes = contractsAssembly.GetTypes()
            .Where(type => string.Equals(
                type.Namespace,
                "ErpSystem.Modules.Platform.Contracts.Tenancy",
                StringComparison.Ordinal))
            .ToArray();
        Assert.Equal([typeof(AllowTenantReadOnlyAttribute)], publicTenancyTypes);

        Assert.Equal(
            [typeof(ISender)],
            typeof(AuthController).GetConstructors().Single().GetParameters()
                .Select(parameter => parameter.ParameterType));

    }

    [Fact]
    public async Task PlatformApplication_OwnsExpiryPlanNormalizationAndReadOnlyCalculation()
    {
        var source = new RecordingPlatformTenantAccessSource
        {
            Snapshot = new TenantAccessSnapshot(
                "Tenant 1",
                "  Enterprise  ",
                PlatformSubscriptionStatus.Active,
                DateTime.SpecifyKind(Now.UtcDateTime, DateTimeKind.Unspecified))
        };
        var services = new ServiceCollection();
        services.AddSingleton<ITenantAccessSource>(source);
        services.AddSingleton<TimeProvider>(new FixedTimeProvider(Now));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var result = await scope.ServiceProvider
            .GetRequiredService<PlatformTenantAccessService>()
            .GetAsync("tenant-1");

        Assert.NotNull(result);
        Assert.Equal("tenant-1", source.LastTenantId);
        Assert.Equal("Tenant 1", result!.TenantName);
        Assert.Equal("Enterprise", result.PlanName);
        Assert.Equal("expired", result.SubscriptionStatus);
        Assert.Equal(Now.UtcDateTime, result.SubscriptionEndsOn);
        Assert.Equal(DateTimeKind.Utc, result.SubscriptionEndsOn!.Value.Kind);
        Assert.True(result.IsReadOnly);
    }

    [Fact]
    public async Task PlatformApplication_PreservesPastDueContractCasingAndFreePlanDefault()
    {
        var source = new RecordingPlatformTenantAccessSource
        {
            Snapshot = new TenantAccessSnapshot(
                "Tenant 2",
                "   ",
                PlatformSubscriptionStatus.PastDue,
                null)
        };
        var services = new ServiceCollection();
        services.AddSingleton<ITenantAccessSource>(source);
        services.AddSingleton<TimeProvider>(new FixedTimeProvider(Now));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var result = await scope.ServiceProvider
            .GetRequiredService<PlatformTenantAccessService>()
            .GetAsync("tenant-2");

        Assert.NotNull(result);
        Assert.Equal("Free", result!.PlanName);
        Assert.Equal("pastDue", result.SubscriptionStatus);
        Assert.False(result.IsReadOnly);
        Assert.Null(result.SubscriptionEndsOn);
    }

    private sealed class RecordingPlatformTenantAccessSource : ITenantAccessSource
    {
        public TenantAccessSnapshot? Snapshot { get; init; }
        public string? LastTenantId { get; private set; }

        public Task<TenantAccessSnapshot?> GetAsync(
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            LastTenantId = tenantId;
            return Task.FromResult(Snapshot);
        }
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }

}

