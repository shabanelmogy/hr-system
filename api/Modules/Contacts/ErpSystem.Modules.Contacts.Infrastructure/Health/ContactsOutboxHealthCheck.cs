using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Contacts.Infrastructure.Health;

/// <summary>
/// Reports the operational state of the Contacts durable outbox without
/// materializing message payloads. The check creates a fresh scope so it never
/// shares a request DbContext with application work.
/// </summary>
public sealed class ContactsOutboxHealthCheck(
    IServiceScopeFactory scopeFactory,
    IOptions<ContactsOutboxDispatcherOptions> configuredOptions,
    TimeProvider timeProvider,
    ILogger<ContactsOutboxHealthCheck> logger) : IHealthCheck
{
    private readonly ContactsOutboxDispatcherOptions _options = Validate(configuredOptions.Value);

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var nowUtc = timeProvider.GetUtcNow();
        var staleProcessingBefore = nowUtc - _options.ProcessingTimeout;

        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ContactsDbContext>();

            var deadRows = await dbContext.OutboxMessages
                .AsNoTracking()
                .Where(message => message.Status == OutboxMessageStatus.Dead)
                .CountAsync(cancellationToken)
                .ConfigureAwait(false);

            var dueMessages = dbContext.OutboxMessages
                .AsNoTracking()
                .Where(message =>
                    message.Status == OutboxMessageStatus.Pending ||
                    (message.Status == OutboxMessageStatus.Failed &&
                     message.NextAttemptOnUtc != null &&
                     message.NextAttemptOnUtc <= nowUtc) ||
                    (message.Status == OutboxMessageStatus.Processing &&
                     message.LastAttemptOnUtc != null &&
                     message.LastAttemptOnUtc <= staleProcessingBefore));

            var dueRows = await dueMessages.CountAsync(cancellationToken).ConfigureAwait(false);
            var oldestDueOnUtc = await dueMessages
                .Select(message => (DateTimeOffset?)message.OccurredOnUtc)
                .MinAsync(cancellationToken)
                .ConfigureAwait(false);
            var staleProcessingRows = await dbContext.OutboxMessages
                .AsNoTracking()
                .Where(message =>
                    message.Status == OutboxMessageStatus.Processing &&
                    message.LastAttemptOnUtc != null &&
                    message.LastAttemptOnUtc <= staleProcessingBefore)
                .CountAsync(cancellationToken)
                .ConfigureAwait(false);

            var dueBacklogAge = oldestDueOnUtc is null
                ? TimeSpan.Zero
                : MaxAge(nowUtc - oldestDueOnUtc.Value);
            var deadRowsExceeded = deadRows > _options.MaxDeadRows;
            var dueBacklogTooOld = dueBacklogAge > _options.MaxDueBacklogAge;
            var data = new Dictionary<string, object>
            {
                ["deadRows"] = deadRows,
                ["dueRows"] = dueRows,
                ["staleProcessingRows"] = staleProcessingRows,
                ["oldestDueAgeSeconds"] = (long)dueBacklogAge.TotalSeconds
            };

            if (deadRowsExceeded || dueBacklogTooOld)
            {
                return HealthCheckResult.Degraded(
                    "Contacts outbox requires operator attention.",
                    data: data);
            }

            return HealthCheckResult.Healthy("Contacts outbox is within configured thresholds.", data);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            // The result intentionally contains no exception text or connection
            // details. Keep logs low-cardinality and free of message payloads.
            logger.LogError(
                "Contacts outbox health query failed. ErrorType={ErrorType}",
                exception.GetType().Name);
            return HealthCheckResult.Unhealthy("Contacts outbox health query failed.");
        }
    }

    private static TimeSpan MaxAge(TimeSpan age) =>
        age > TimeSpan.Zero ? age : TimeSpan.Zero;

    private static ContactsOutboxDispatcherOptions Validate(ContactsOutboxDispatcherOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        options.Validate();
        return options;
    }
}
