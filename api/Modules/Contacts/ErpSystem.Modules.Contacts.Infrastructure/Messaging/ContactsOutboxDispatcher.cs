using System.Text.Json;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Contacts.Contracts;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Contacts.Infrastructure.Messaging;

/// <summary>
/// Executes one durable Contacts outbox batch. The producer owns retries and
/// dead-letter state; the publisher only transports a deserialized fact.
/// </summary>
public sealed class ContactsOutboxDispatcher(
    ContactsOutbox outbox,
    IIntegrationEventPublisher publisher,
    TimeProvider timeProvider,
    IOptions<ContactsOutboxDispatcherOptions> configuredOptions,
    ILogger<ContactsOutboxDispatcher>? logger = null)
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly ContactsOutboxDispatcherOptions _options = Validate(configuredOptions.Value);
    private readonly ILogger<ContactsOutboxDispatcher> _logger =
        logger ?? NullLogger<ContactsOutboxDispatcher>.Instance;

    public async Task<int> DispatchOnceAsync(CancellationToken cancellationToken = default)
    {
        var nowUtc = timeProvider.GetUtcNow();
        var messages = await outbox.ClaimDueAsync(
            nowUtc,
            _options.BatchSize,
            _options.ProcessingTimeout,
            cancellationToken).ConfigureAwait(false);

        var published = 0;
        var failed = 0;
        var dead = 0;
        try
        {
            foreach (var message in messages)
            {
                try
                {
                    var integrationEvent = Deserialize(message);
                    await publisher.PublishAsync(integrationEvent, cancellationToken).ConfigureAwait(false);
                    await outbox.MarkPublishedAsync(
                        message.EventId,
                        timeProvider.GetUtcNow(),
                        cancellationToken).ConfigureAwait(false);
                    published++;
                    _logger.LogInformation(
                        "Contacts outbox event published. EventId={EventId} Attempts={Attempts}",
                        message.EventId,
                        message.Attempts);
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (UnsupportedIntegrationEventException exception)
                {
                    await outbox.MarkDeadAsync(
                        message.EventId,
                        exception.Message,
                        cancellationToken).ConfigureAwait(false);
                    dead++;
                    _logger.LogWarning(
                        "Contacts outbox event dead-lettered because it is unsupported. EventId={EventId} Attempts={Attempts} ErrorType={ErrorType}",
                        message.EventId,
                        message.Attempts,
                        exception.GetType().Name);
                }
                catch (Exception exception)
                {
                    if (message.Attempts >= _options.MaxAttempts)
                    {
                        await outbox.MarkDeadAsync(
                            message.EventId,
                            exception.Message,
                            cancellationToken).ConfigureAwait(false);
                        dead++;
                        _logger.LogWarning(
                            "Contacts outbox event dead-lettered after retry limit. EventId={EventId} Attempts={Attempts} ErrorType={ErrorType}",
                            message.EventId,
                            message.Attempts,
                            exception.GetType().Name);
                        continue;
                    }

                    await outbox.MarkFailedAsync(
                        message.EventId,
                        exception.Message,
                        timeProvider.GetUtcNow() + RetryDelay(message.Attempts),
                        cancellationToken).ConfigureAwait(false);
                    failed++;
                    _logger.LogWarning(
                        "Contacts outbox event scheduled for retry. EventId={EventId} Attempts={Attempts} ErrorType={ErrorType}",
                        message.EventId,
                        message.Attempts,
                        exception.GetType().Name);
                }
            }
        }
        finally
        {
            var logLevel = messages.Count == 0 ? LogLevel.Debug : LogLevel.Information;
            _logger.Log(
                logLevel,
                "Contacts outbox batch completed. Claimed={Claimed} Published={Published} Failed={Failed} Dead={Dead} Cancelled={Cancelled}",
                messages.Count,
                published,
                failed,
                dead,
                cancellationToken.IsCancellationRequested);
        }

        return messages.Count;
    }

    private IntegrationEvent Deserialize(OutboxMessage message)
    {
        if (message.EventVersion != 1)
            throw new UnsupportedIntegrationEventException(
                $"Unsupported Contacts integration event version {message.EventVersion} for '{message.EventName}'.");

        try
        {
            IntegrationEvent? integrationEvent = message.EventName switch
            {
                PartyCreatedIntegrationEvent.EventNameValue =>
                    (IntegrationEvent?)JsonSerializer.Deserialize<PartyCreatedIntegrationEvent>(message.Payload, SerializerOptions),
                PartyUpdatedIntegrationEvent.EventNameValue =>
                    JsonSerializer.Deserialize<PartyUpdatedIntegrationEvent>(message.Payload, SerializerOptions),
                _ => throw new UnsupportedIntegrationEventException(
                    $"Unsupported Contacts integration event '{message.EventName}' v{message.EventVersion}.")
            };

            return integrationEvent ?? throw new UnsupportedIntegrationEventException(
                $"Contacts integration event '{message.EventName}' could not be deserialized.");
        }
        catch (JsonException exception)
        {
            throw new UnsupportedIntegrationEventException(
                $"Contacts integration event '{message.EventName}' payload is invalid JSON: {exception.Message}");
        }
    }

    private TimeSpan RetryDelay(int attempts)
    {
        var exponent = Math.Clamp(attempts - 1, 0, 30);
        var multiplier = Math.Pow(2, exponent);
        var ticks = Math.Min(
            _options.MaxRetryDelay.Ticks,
            _options.BaseRetryDelay.Ticks * multiplier);
        return TimeSpan.FromTicks((long)ticks);
    }

    private static ContactsOutboxDispatcherOptions Validate(ContactsOutboxDispatcherOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        options.Validate();
        return options;
    }

    private sealed class UnsupportedIntegrationEventException(string message) : Exception(message);
}
