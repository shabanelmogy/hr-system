using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.PlatformCompatibility;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.Authentication.SelectionChallenges;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class PlatformSelectionChallengeOwnershipTests
{
    private static readonly DateTimeOffset Now =
        new(2026, 9, 10, 18, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Ownership_PointsFromHrToPlatformContractsOnly()
    {
        var platformContractsReferences = typeof(ISelectionChallengeService).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var platformApplicationReferences = typeof(ErpSystem.Modules.Platform.Application.AssemblyReference).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var hrApplicationReferences = typeof(PlatformSelectionChallengeSource).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();
        var loginDependencies = typeof(AuthLoginService)
            .GetConstructors()
            .Single()
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.DoesNotContain(platformContractsReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.DoesNotContain(platformApplicationReferences, name =>
            name?.StartsWith("ErpSystem.Modules.HR", StringComparison.Ordinal) == true);
        Assert.Contains("ErpSystem.Modules.Platform.Contracts", hrApplicationReferences);
        Assert.DoesNotContain("ErpSystem.Modules.Platform.Application", hrApplicationReferences);
        Assert.Contains(typeof(ISelectionChallengeService), loginDependencies);
        Assert.DoesNotContain(typeof(AuthenticationSelectionChallengeStore), loginDependencies);
        Assert.Equal("ErpSystem.Modules.HR.Infrastructure", typeof(AuthenticationSelectionChallenge).Assembly.GetName().Name);
    }

    [Fact]
    public void CanonicalScopes_PreserveExistingJwtWireValues()
    {
        Assert.Equal("tenant_selection", SelectionChallengeScopes.TenantSelection);
        Assert.Equal("company_selection", SelectionChallengeScopes.CompanySelection);
        Assert.Equal(AuthenticationTokenClaimNames.TenantSelectionScope, SelectionChallengeScopes.TenantSelection);
        Assert.Equal(AuthenticationTokenClaimNames.CompanySelectionScope, SelectionChallengeScopes.CompanySelection);
    }

    [Fact]
    public async Task PlatformApplication_OwnsClockAndPreservesNullableTenantBinding()
    {
        var source = new RecordingSelectionChallengeSource();
        var services = new ServiceCollection();
        services.AddSingleton<ISelectionChallengeSource>(source);
        services.AddSingleton<TimeProvider>(new FixedTimeProvider(Now));
        services.AddPlatformApplication();

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ISelectionChallengeService>();

        await service.StoreAsync(new SelectionChallengeRegistrationRequest(
            "jti-1", "user-1", SelectionChallengeScopes.TenantSelection,
            Now.AddMinutes(5).UtcDateTime, null));
        Assert.NotNull(source.Stored);
        Assert.Equal(Now.UtcDateTime, source.Stored!.CreatedOn);
        Assert.Equal(Now.UtcDateTime, source.LastStoreCutoff);
        Assert.Null(source.Stored.TenantId);

        source.ConsumeResult = true;
        var consumed = await service.ConsumeAsync(new SelectionChallengeConsumeRequest(
            "jti-1", "user-1", SelectionChallengeScopes.TenantSelection, null));
        Assert.True(consumed);
        Assert.Equal(Now.UtcDateTime, source.LastConsumeCutoff);
        Assert.Null(source.LastConsumeRequest?.TenantId);
    }

    [Fact]
    public async Task HrCompatibilitySource_MapsWithoutApplyingExpiryPolicy()
    {
        var store = new RecordingPersistenceStore();
        var source = new PlatformSelectionChallengeSource(store);
        var snapshot = new SelectionChallengeSnapshot(
            "expired-jti", "user-1", SelectionChallengeScopes.CompanySelection,
            "tenant-1", Now.AddMinutes(-10).UtcDateTime, Now.AddMinutes(-1).UtcDateTime);

        await source.StoreAsync(snapshot, Now.UtcDateTime);

        Assert.NotNull(store.Stored);
        Assert.Equal(snapshot.JwtId, store.Stored!.JwtId);
        Assert.Equal(snapshot.CreatedOn, store.Stored.CreatedOn);
        Assert.Equal(snapshot.ExpiresOn, store.Stored.ExpiresOn);
        Assert.Equal(Now.UtcDateTime, store.LastStoreCutoff);
    }

    [Fact]
    public void HrPersistenceModel_KeepsExistingSchemaKeyConcurrencyIndexesAndIdentityFk()
    {
        using var context = CreateContext();
        var entity = context.Model.FindEntityType(typeof(AuthenticationSelectionChallenge));
        Assert.NotNull(entity);
        Assert.Equal(ApplicationDbContext.Schema, entity!.GetSchema());
        Assert.Equal("AuthenticationSelectionChallenges", entity.GetTableName());
        Assert.Equal([nameof(AuthenticationSelectionChallenge.JwtId)],
            entity.FindPrimaryKey()!.Properties.Select(property => property.Name));
        Assert.True(entity.FindProperty(nameof(AuthenticationSelectionChallenge.RowVersion))!.IsConcurrencyToken);

        var indexes = entity.GetIndexes()
            .Select(index => index.Properties.Select(property => property.Name).ToArray())
            .ToArray();
        Assert.Contains(indexes, properties => properties.SequenceEqual([nameof(AuthenticationSelectionChallenge.ExpiresOn)]));
        Assert.Contains(indexes, properties => properties.SequenceEqual([
            nameof(AuthenticationSelectionChallenge.UserId), nameof(AuthenticationSelectionChallenge.Scope)]));

        var userFk = Assert.Single(entity.GetForeignKeys(), foreignKey =>
            foreignKey.PrincipalEntityType.ClrType == typeof(ApplicationUser));
        // The local entity configuration requests Cascade, but the final HR model's
        // global RestrictCascadeDelete policy intentionally wins. Pin effective behavior.
        Assert.Equal(DeleteBehavior.Restrict, userFk.DeleteBehavior);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ApplicationDbContext(options, new EmptyCurrentActor(), TimeProvider.System);
    }

    private sealed class RecordingSelectionChallengeSource : ISelectionChallengeSource
    {
        public SelectionChallengeSnapshot? Stored { get; private set; }
        public DateTime? LastStoreCutoff { get; private set; }
        public SelectionChallengeConsumeRequest? LastConsumeRequest { get; private set; }
        public DateTime? LastConsumeCutoff { get; private set; }
        public bool ConsumeResult { get; set; }

        public Task StoreAsync(
            SelectionChallengeSnapshot challenge,
            DateTime utcNow,
            CancellationToken cancellationToken = default)
        {
            Stored = challenge;
            LastStoreCutoff = utcNow;
            return Task.CompletedTask;
        }

        public Task<bool> ConsumeAsync(
            SelectionChallengeConsumeRequest request,
            DateTime utcNow,
            CancellationToken cancellationToken = default)
        {
            LastConsumeRequest = request;
            LastConsumeCutoff = utcNow;
            return Task.FromResult(ConsumeResult);
        }
    }

    private sealed class RecordingPersistenceStore : ISelectionChallengePersistenceStore
    {
        public SelectionChallengePersistenceRecord? Stored { get; private set; }
        public DateTime? LastStoreCutoff { get; private set; }

        public Task StoreAsync(
            SelectionChallengePersistenceRecord challenge,
            DateTime utcNow,
            CancellationToken cancellationToken = default)
        {
            Stored = challenge;
            LastStoreCutoff = utcNow;
            return Task.CompletedTask;
        }

        public Task<bool> ConsumeAsync(
            string jwtId,
            string userId,
            string scope,
            string? tenantId,
            DateTime utcNow,
            CancellationToken cancellationToken = default) => Task.FromResult(false);
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class EmptyCurrentActor : ICurrentActor
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
