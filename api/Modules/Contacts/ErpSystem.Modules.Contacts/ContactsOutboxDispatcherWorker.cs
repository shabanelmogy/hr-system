using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Contacts;

/// <summary>
/// Host lifecycle adapter for Contacts' durable outbox dispatcher. The actual
/// dispatch/retry policy remains module Infrastructure; only the recurring
/// process lifetime belongs in the bootstrap composition root.
/// </summary>
internal sealed class ContactsOutboxDispatcherWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<ContactsOutboxDispatcherOptions> configuredOptions,
    ILogger<ContactsOutboxDispatcherWorker> logger) : BackgroundService
{
    private readonly ContactsOutboxDispatcherOptions _options = Validate(configuredOptions.Value);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var processed = 0;
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var dispatcher = scope.ServiceProvider.GetRequiredService<ContactsOutboxDispatcher>();
                processed = await dispatcher.DispatchOnceAsync(stoppingToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Contacts integration-event outbox dispatch failed.");
            }

            if (processed == 0)
            {
                try
                {
                    await Task.Delay(_options.PollInterval, stoppingToken).ConfigureAwait(false);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }
    }

    private static ContactsOutboxDispatcherOptions Validate(ContactsOutboxDispatcherOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        options.Validate();
        return options;
    }
}
