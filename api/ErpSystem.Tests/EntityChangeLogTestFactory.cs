using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.HR.Infrastructure.Features.Platform.EntityChangeLogs.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

internal static class EntityChangeLogTestFactory
{
    public static IEntityChangeLogService Create(
        ApplicationDbContext context,
        ICurrentExecutionContext currentActor,
        TimeProvider timeProvider)
    {
        var adapter = new EntityChangeLogPersistenceAdapter(context);
        var services = new ServiceCollection();
        services.AddSingleton(currentActor);
        services.AddSingleton<ICurrentExecutionContext>(currentActor);
        services.AddSingleton(timeProvider);
        services.AddSingleton<IEntityChangeLogStore>(adapter);
        services.AddSingleton<IEntityChangeLogQueryStore>(adapter);
        services.AddPlatformApplication();

        return services.BuildServiceProvider().GetRequiredService<IEntityChangeLogService>();
    }
}
