using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class AuthenticationSelectionChallengeStoreTests
{
    [Fact]
    public async Task SelectionChallengeService_DelegatesStoreAndConsumeToPlatformPort()
    {
        var source = new RecordingSource();
        using var provider = new ServiceCollection().AddSingleton<ISelectionChallengeSource>(source).AddPlatformApplication().BuildServiceProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<ISelectionChallengeService>();
        await service.StoreAsync(new SelectionChallengeRegistrationRequest("jti", "user", SelectionChallengeScopes.CompanySelection, DateTime.UtcNow.AddMinutes(5), "tenant"));
        Assert.NotNull(source.Stored);
        Assert.True(await service.ConsumeAsync(new SelectionChallengeConsumeRequest("jti", "user", SelectionChallengeScopes.CompanySelection, "tenant")));
        Assert.False(await service.ConsumeAsync(new SelectionChallengeConsumeRequest("jti", "user", SelectionChallengeScopes.CompanySelection, "tenant")));
    }

    private sealed class RecordingSource : ISelectionChallengeSource
    {
        public SelectionChallengeSnapshot? Stored { get; private set; }
        public Task StoreAsync(SelectionChallengeSnapshot challenge, DateTime utcNow, CancellationToken cancellationToken = default) { Stored = challenge; return Task.CompletedTask; }
        public Task<bool> ConsumeAsync(SelectionChallengeConsumeRequest request, DateTime utcNow, CancellationToken cancellationToken = default)
        {
            if (Stored is null || Stored.JwtId != request.JwtId || Stored.UserId != request.UserId || Stored.Scope != request.Scope || Stored.TenantId != request.TenantId || Stored.ExpiresOn <= utcNow) return Task.FromResult(false);
            Stored = null;
            return Task.FromResult(true);
        }
    }
}