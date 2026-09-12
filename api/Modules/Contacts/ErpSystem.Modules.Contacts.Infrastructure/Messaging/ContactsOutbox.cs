using System.Text.Json;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Contacts.Application.Messaging;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Contacts.Infrastructure.Messaging;

public sealed class ContactsOutbox(ContactsDbContext dbContext) : IContactsOutbox
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public void Enqueue(IntegrationEvent integrationEvent)
    {
        ArgumentNullException.ThrowIfNull(integrationEvent);
        var payload = JsonSerializer.Serialize(integrationEvent, integrationEvent.GetType(), SerializerOptions);
        dbContext.OutboxMessages.Add(OutboxMessage.Create(integrationEvent, payload));
    }

    public async Task<IReadOnlyList<OutboxMessage>> ClaimDueAsync(
        DateTimeOffset nowUtc,
        int batchSize,
        CancellationToken cancellationToken = default) =>
        await ClaimDueAsync(nowUtc, batchSize, TimeSpan.FromMinutes(5), cancellationToken)
            .ConfigureAwait(false);

    public async Task<IReadOnlyList<OutboxMessage>> ClaimDueAsync(
        DateTimeOffset nowUtc,
        int batchSize,
        TimeSpan processingTimeout,
        CancellationToken cancellationToken = default)
    {
        if (batchSize <= 0)
            throw new ArgumentOutOfRangeException(nameof(batchSize));
        if (processingTimeout <= TimeSpan.Zero)
            throw new ArgumentOutOfRangeException(nameof(processingTimeout));

        var staleBefore = nowUtc - processingTimeout;

        var candidateIds = await dbContext.OutboxMessages
            .AsNoTracking()
            .Where(message =>
                message.Status == OutboxMessageStatus.Pending ||
                (message.Status == OutboxMessageStatus.Failed &&
                 message.NextAttemptOnUtc != null &&
                 message.NextAttemptOnUtc <= nowUtc) ||
                (message.Status == OutboxMessageStatus.Processing &&
                 message.LastAttemptOnUtc != null &&
                 message.LastAttemptOnUtc <= staleBefore))
            .OrderBy(message => message.OccurredOnUtc)
            .ThenBy(message => message.EventId)
            .Select(message => message.EventId)
            .Take(batchSize)
            .ToListAsync(cancellationToken);

        var claimed = new List<OutboxMessage>(candidateIds.Count);
        foreach (var eventId in candidateIds)
        {
            var message = await dbContext.OutboxMessages
                .SingleOrDefaultAsync(candidate => candidate.EventId == eventId, cancellationToken);
            var recovering = message is not null &&
                             message.Status == OutboxMessageStatus.Processing &&
                             message.LastAttemptOnUtc is not null &&
                             message.LastAttemptOnUtc <= staleBefore;
            var due = message is not null &&
                (message.Status == OutboxMessageStatus.Pending ||
                 (message.Status == OutboxMessageStatus.Failed &&
                  message.NextAttemptOnUtc is not null &&
                  message.NextAttemptOnUtc <= nowUtc) ||
                 recovering);
            if (!due)
                continue;

            message!.StartAttempt(nowUtc, recovering);
            try
            {
                await dbContext.SaveChangesAsync(cancellationToken);
                claimed.Add(message);
            }
            catch (DbUpdateConcurrencyException)
            {
                dbContext.Entry(message).State = EntityState.Detached;
            }
        }

        return claimed;
    }

    public async Task MarkPublishedAsync(
        Guid eventId,
        DateTimeOffset publishedOnUtc,
        CancellationToken cancellationToken = default)
    {
        var message = await RequiredMessageAsync(eventId, cancellationToken);
        message.MarkPublished(publishedOnUtc);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkFailedAsync(
        Guid eventId,
        string error,
        DateTimeOffset? nextAttemptOnUtc,
        CancellationToken cancellationToken = default)
    {
        var message = await RequiredMessageAsync(eventId, cancellationToken);
        message.MarkFailed(error, nextAttemptOnUtc);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkDeadAsync(
        Guid eventId,
        string error,
        CancellationToken cancellationToken = default)
    {
        var message = await RequiredMessageAsync(eventId, cancellationToken);
        message.MarkDead(error);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<OutboxMessage> RequiredMessageAsync(Guid eventId, CancellationToken cancellationToken)
    {
        if (eventId == Guid.Empty)
            throw new ArgumentException("Event id must not be empty.", nameof(eventId));

        return await dbContext.OutboxMessages.SingleOrDefaultAsync(
                   message => message.EventId == eventId,
                   cancellationToken)
               ?? throw new KeyNotFoundException($"Outbox message '{eventId}' was not found.");
    }
}
