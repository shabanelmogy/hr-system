using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.SessionValidation;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class PlatformSessionValidationOwnershipTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 9, 10, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void SessionValidationOwnership_PointsFromHrToPlatformContractsOnly()
    {
        var platformContractsReferences = typeof(ISessionValidationService).Assembly
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
            "ErpSystem.Modules.HR.Application.Features.Security.Authentication.PlatformCompatibility.PlatformSessionValidationSource"));
        Assert.Null(hrApplication.GetType(
            "ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services.ISessionValidationReadStore"));
        Assert.Equal("ErpSystem.Modules.HR.Infrastructure", typeof(RefreshToken).Assembly.GetName().Name);
    }

    [Fact]
    public async Task PlatformApplication_PreservesCurrentBearerSessionEligibilitySemantics()
    {
        var source = new RecordingSessionValidationSource
        {
            Snapshot = ValidSnapshot(TenantSubscriptionStatus.Expired)
        };
        var services = new ServiceCollection();
        services.AddSingleton<ISessionValidationSource>(source);
        services.AddSingleton<TimeProvider>(new FixedTimeProvider(Now));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ISessionValidationService>();
        var request = ValidRequest();

        Assert.True((await service.ValidateAsync(request)).IsValid);
        Assert.Equal(
            (request.UserId, request.SessionId, request.TenantId, request.CompanyId),
            source.LastScope);

        source.Snapshot = ValidSnapshot(TenantSubscriptionStatus.PastDue);
        Assert.True((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { IsDisabled = true };
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { LockoutEnd = Now.AddTicks(1) };
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { LockoutEnd = Now };
        Assert.True((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { SecurityStamp = "different-stamp" };
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { HasTenantMembership = false };
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { IsTenantActive = false };
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot(TenantSubscriptionStatus.Suspended);
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot(TenantSubscriptionStatus.Cancelled);
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { HasCompanyAccess = false };
        Assert.False((await service.ValidateAsync(request)).IsValid);

        source.Snapshot = ValidSnapshot() with { IsCompanyActive = false };
        Assert.False((await service.ValidateAsync(request)).IsValid);
    }

    [Fact]
    public async Task PlatformApplication_UsesTimeProviderForRefreshSessionActivityBoundary()
    {
        var source = new RecordingSessionValidationSource
        {
            Snapshot = ValidSnapshot() with
            {
                RefreshSessions =
                [
                    new("session-1", 7, Now.UtcDateTime, null)
                ]
            }
        };
        var services = new ServiceCollection();
        services.AddSingleton<ISessionValidationSource>(source);
        services.AddSingleton<TimeProvider>(new FixedTimeProvider(Now));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ISessionValidationService>();

        Assert.False((await service.ValidateAsync(ValidRequest())).IsValid);

        source.Snapshot = ValidSnapshot() with
        {
            RefreshSessions =
            [
                new("session-1", 7, Now.AddMinutes(1).UtcDateTime, Now.AddSeconds(-1).UtcDateTime),
                new("different-session", 7, Now.AddMinutes(1).UtcDateTime, null),
                new("session-1", 8, Now.AddMinutes(1).UtcDateTime, null)
            ]
        };
        Assert.False((await service.ValidateAsync(ValidRequest())).IsValid);

        source.Snapshot = ValidSnapshot();
        Assert.True((await service.ValidateAsync(ValidRequest())).IsValid);
    }

    private static SessionValidationRequest ValidRequest() =>
        new("user-1", "session-1", "security-stamp", "tenant-1", 7);

    private static SessionValidationSnapshot ValidSnapshot(
        TenantSubscriptionStatus status = TenantSubscriptionStatus.Active) =>
        new(
            IsDisabled: false,
            LockoutEnd: null,
            SecurityStamp: "security-stamp",
            HasTenantMembership: true,
            IsTenantActive: true,
            TenantSubscriptionStatus: status,
            HasCompanyAccess: true,
            IsCompanyActive: true,
            RefreshSessions:
            [
                new("session-1", 7, Now.AddMinutes(1).UtcDateTime, null)
            ]);

    private sealed class RecordingSessionValidationSource : ISessionValidationSource
    {
        public SessionValidationSnapshot? Snapshot { get; set; }
        public (string UserId, string SessionId, string TenantId, int CompanyId)? LastScope { get; private set; }

        public Task<SessionValidationSnapshot?> GetAsync(
            string userId,
            string sessionId,
            string tenantId,
            int companyId,
            CancellationToken cancellationToken = default)
        {
            LastScope = (userId, sessionId, tenantId, companyId);
            return Task.FromResult(Snapshot);
        }
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

}
