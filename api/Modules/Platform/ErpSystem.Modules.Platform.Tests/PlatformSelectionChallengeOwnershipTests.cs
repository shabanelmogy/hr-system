using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformSelectionChallengeOwnershipTests
{
    [Fact]
    public void PlatformApplicationRegistersSelectionChallengeService()
    {
        using var provider = new ServiceCollection()
            .AddSingleton<ISelectionChallengeSource, RecordingSource>()
            .AddPlatformApplication()
            .BuildServiceProvider();
        using var scope = provider.CreateScope();
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<ISelectionChallengeService>());
    }

    private sealed class RecordingSource : ISelectionChallengeSource
    {
        public Task StoreAsync(SelectionChallengeSnapshot challenge, DateTime utcNow, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<bool> ConsumeAsync(SelectionChallengeConsumeRequest request, DateTime utcNow, CancellationToken cancellationToken = default) => Task.FromResult(false);
    }
}