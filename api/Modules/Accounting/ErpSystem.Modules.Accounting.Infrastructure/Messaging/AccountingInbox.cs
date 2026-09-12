using System.Data;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Application.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace ErpSystem.Modules.Accounting.Infrastructure.Messaging;

/// <summary>
/// Retry-safe Accounting inbox receipt. On relational providers the consumer work
/// and the processed receipt share one serializable database transaction. Consumers
/// receive the same AccountingDbContext so durable side effects can participate in
/// that transaction; external side effects are deliberately outside this foundation.
/// </summary>
public sealed class AccountingInbox(AccountingDbContext dbContext, TimeProvider timeProvider)
    : IAccountingInbox
{
    public async Task<IntegrationEventConsumeResult> ExecuteOnceAsync(
        string consumerName,
        IntegrationEvent integrationEvent,
        Func<CancellationToken, Task> handler,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(handler);
        var result = await ExecuteOnceAsync(
            consumerName,
            integrationEvent,
            (_, token) => handler(token),
            cancellationToken);

        return result == InboxConsumeResult.Duplicate
            ? IntegrationEventConsumeResult.Duplicate
            : IntegrationEventConsumeResult.Processed;
    }

    public async Task<InboxConsumeResult> ExecuteOnceAsync(
        string consumerName,
        IntegrationEvent integrationEvent,
        Func<AccountingDbContext, CancellationToken, Task> handler,
        CancellationToken cancellationToken = default)
    {
        var normalizedConsumer = InboxMessage.NormalizeConsumerName(consumerName);
        ArgumentNullException.ThrowIfNull(integrationEvent);
        ArgumentNullException.ThrowIfNull(handler);

        IDbContextTransaction? transaction = null;
        try
        {
            if (dbContext.Database.IsRelational())
            {
                transaction = await dbContext.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable,
                    cancellationToken);
            }

            var receipt = await dbContext.InboxMessages
                .SingleOrDefaultAsync(
                    message => message.ConsumerName == normalizedConsumer &&
                               message.EventId == integrationEvent.EventId,
                    cancellationToken);

            if (receipt?.Status == InboxMessageStatus.Processed)
            {
                if (transaction is not null)
                    await transaction.CommitAsync(cancellationToken);
                return InboxConsumeResult.Duplicate;
            }

            var nowUtc = timeProvider.GetUtcNow();
            if (receipt is null)
            {
                receipt = InboxMessage.Start(normalizedConsumer, integrationEvent, nowUtc);
                dbContext.InboxMessages.Add(receipt);
            }
            else
            {
                receipt.StartRetry(nowUtc);
            }

            // Persist the in-transaction reservation before invoking the handler.
            // SQL's composite PK plus Serializable isolation prevents two deliveries
            // from successfully processing the same consumer/event pair concurrently.
            await dbContext.SaveChangesAsync(cancellationToken);

            await handler(dbContext, cancellationToken);

            receipt.MarkProcessed(timeProvider.GetUtcNow());
            await dbContext.SaveChangesAsync(cancellationToken);

            if (transaction is not null)
                await transaction.CommitAsync(cancellationToken);

            return InboxConsumeResult.Processed;
        }
        catch (Exception exception)
        {
            if (transaction is not null)
            {
                await transaction.RollbackAsync(CancellationToken.None);
                await transaction.DisposeAsync();
                transaction = null;
            }

            dbContext.ChangeTracker.Clear();

            // A concurrent delivery may have won the unique receipt race while this
            // transaction was rolling back. Treat that as a duplicate, not a failure.
            var alreadyProcessed = await dbContext.InboxMessages
                .AsNoTracking()
                .AnyAsync(
                    message => message.ConsumerName == normalizedConsumer &&
                               message.EventId == integrationEvent.EventId &&
                               message.Status == InboxMessageStatus.Processed,
                    CancellationToken.None);
            if (alreadyProcessed)
                return InboxConsumeResult.Duplicate;

            await RecordFailureAsync(
                normalizedConsumer,
                integrationEvent,
                exception,
                CancellationToken.None);
            throw;
        }
        finally
        {
            if (transaction is not null)
                await transaction.DisposeAsync();
        }
    }

    private async Task RecordFailureAsync(
        string consumerName,
        IntegrationEvent integrationEvent,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var nowUtc = timeProvider.GetUtcNow();
        var receipt = await dbContext.InboxMessages
            .SingleOrDefaultAsync(
                message => message.ConsumerName == consumerName &&
                           message.EventId == integrationEvent.EventId,
                cancellationToken);

        if (receipt?.Status == InboxMessageStatus.Processed)
            return;

        if (receipt is null)
        {
            receipt = InboxMessage.Start(consumerName, integrationEvent, nowUtc);
            dbContext.InboxMessages.Add(receipt);
        }

        receipt.RecordFailedAttempt(nowUtc, exception.Message);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
