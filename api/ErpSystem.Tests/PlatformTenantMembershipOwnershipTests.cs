using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.TenantMembership;
using Microsoft.Extensions.DependencyInjection;
using PlatformSubscriptionStatus = ErpSystem.Modules.Platform.Contracts.Tenancy.TenantSubscriptionStatus;

namespace ErpSystem.Tests;

public sealed class PlatformTenantMembershipOwnershipTests
{
    [Fact]
    public void TenantMembershipOwnership_PointsFromHrToPlatformContractsOnly()
    {
        var platformContractsReferences = typeof(ITenantMembershipService).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformApplicationReferences = typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        var hrApplication = typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly;
        Assert.Null(hrApplication.GetType(
            "ErpSystem.Modules.HR.Application.Features.Security.Authentication.PlatformCompatibility.PlatformTenantMembershipSource"));
        Assert.Null(hrApplication.GetType(
            "ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services.ITenantMembershipReadStore"));
        Assert.Equal("ErpSystem.Modules.HR.Infrastructure", typeof(UserTenantAccess).Assembly.GetName().Name);
    }

    [Fact]
    public async Task PlatformApplication_OwnsEligibilityAndDefaultThenNameOrdering()
    {
        var source = new RecordingTenantMembershipSource
        {
            Snapshots =
            [
                new("active-z", "az", "Zulu", false, true, PlatformSubscriptionStatus.Active),
                new("past-due", "pd", "Past Due", false, true, PlatformSubscriptionStatus.PastDue),
                new("expired", "ex", "Expired", true, true, PlatformSubscriptionStatus.Expired),
                new("inactive", "in", "Inactive", true, false, PlatformSubscriptionStatus.Active),
                new("suspended", "su", "Suspended", true, true, PlatformSubscriptionStatus.Suspended),
                new("cancelled", "ca", "Cancelled", true, true, PlatformSubscriptionStatus.Cancelled),
                new("active-a", "aa", "Alpha", false, true, PlatformSubscriptionStatus.Active)
            ]
        };
        var services = new ServiceCollection();
        services.AddSingleton<ITenantMembershipSource>(source);
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ITenantMembershipService>();

        var tenants = await service.GetAvailableTenantsAsync("user-1");

        Assert.Equal(["expired", "active-a", "past-due", "active-z"], tenants.Select(tenant => tenant.Id));
        Assert.True(await service.HasTenantAccessAsync("user-1", "expired"));
        Assert.True(await service.HasTenantAccessAsync("user-1", "past-due"));
        Assert.False(await service.HasTenantAccessAsync("user-1", "inactive"));
        Assert.False(await service.HasTenantAccessAsync("user-1", "suspended"));
        Assert.False(await service.HasTenantAccessAsync("user-1", "cancelled"));
        Assert.Equal("user-1", source.LastUserId);
    }

    private sealed class RecordingTenantMembershipSource : ITenantMembershipSource
    {
        public IReadOnlyList<TenantMembershipSnapshot> Snapshots { get; init; } = [];
        public string? LastUserId { get; private set; }

        public Task<IReadOnlyList<TenantMembershipSnapshot>> GetAsync(
            string userId,
            CancellationToken cancellationToken = default)
        {
            LastUserId = userId;
            return Task.FromResult(Snapshots);
        }
    }

}
