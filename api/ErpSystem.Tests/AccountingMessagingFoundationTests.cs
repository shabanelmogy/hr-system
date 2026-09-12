using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Tests;

public sealed class AccountingMessagingFoundationTests
{
    [Fact]
    public async Task Outbox_StagesEventUntilOwningUnitOfWorkCommits()
    {
        var options = CreateOptions();
        var eventId = Guid.NewGuid();
        var integrationEvent = new TestIntegrationEvent(
            eventId,
            DateTimeOffset.Parse("2026-09-09T18:00:00Z"),
            "correlation-42",
            "causation-17",
            "posted");

        await using var writer = new AccountingDbContext(options);
        var outbox = new AccountingOutbox(writer);
        outbox.Enqueue(integrationEvent);

        var staged = Assert.Single(writer.ChangeTracker.Entries<OutboxMessage>());
        Assert.Equal(EntityState.Added, staged.State);

        await using (var observerBeforeCommit = new AccountingDbContext(options))
            Assert.Empty(await observerBeforeCommit.OutboxMessages.AsNoTracking().ToListAsync());

        await writer.SaveChangesAsync();

        await using var observerAfterCommit = new AccountingDbContext(options);
        var persisted = Assert.Single(await observerAfterCommit.OutboxMessages.AsNoTracking().ToListAsync());
        Assert.Equal(eventId, persisted.EventId);
        Assert.Equal("accounting.test.v1", persisted.EventName);
        Assert.Equal(1, persisted.EventVersion);
        Assert.Equal("correlation-42", persisted.CorrelationId);
        Assert.Equal("causation-17", persisted.CausationId);
        Assert.Equal(OutboxMessageStatus.Pending, persisted.Status);
        Assert.Equal(0, persisted.Attempts);
        Assert.Contains("posted", persisted.Payload, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Outbox_FailureSchedulesRetryAndAttemptsAreMonotonic()
    {
        var options = CreateOptions();
        var eventId = Guid.NewGuid();
        var firstAttempt = DateTimeOffset.Parse("2026-09-09T18:10:00Z");
        var retryAt = firstAttempt.AddMinutes(5);

        await using var context = new AccountingDbContext(options);
        var outbox = new AccountingOutbox(context);
        outbox.Enqueue(new TestIntegrationEvent(eventId, firstAttempt.AddMinutes(-1), null, null, "retry"));
        await context.SaveChangesAsync();

        var firstClaim = Assert.Single(await outbox.ClaimDueAsync(firstAttempt, 10));
        Assert.Equal(OutboxMessageStatus.Processing, firstClaim.Status);
        Assert.Equal(1, firstClaim.Attempts);

        await outbox.MarkFailedAsync(eventId, "transport unavailable", retryAt);

        Assert.Empty(await outbox.ClaimDueAsync(retryAt.AddTicks(-1), 10));

        var secondClaim = Assert.Single(await outbox.ClaimDueAsync(retryAt, 10));
        Assert.Equal(OutboxMessageStatus.Processing, secondClaim.Status);
        Assert.Equal(2, secondClaim.Attempts);

        var publishedOn = retryAt.AddSeconds(2);
        await outbox.MarkPublishedAsync(eventId, publishedOn);

        context.ChangeTracker.Clear();
        var persisted = await context.OutboxMessages.SingleAsync(message => message.EventId == eventId);
        Assert.Equal(OutboxMessageStatus.Published, persisted.Status);
        Assert.Equal(2, persisted.Attempts);
        Assert.Equal(publishedOn, persisted.PublishedOnUtc);
        Assert.Null(persisted.NextAttemptOnUtc);
        Assert.Null(persisted.LastError);
    }

    [Fact]
    public async Task Inbox_DuplicateDeliveryRunsConsumerOnlyOnce()
    {
        var options = CreateOptions();
        var incoming = new TestIntegrationEvent(
            Guid.NewGuid(),
            DateTimeOffset.Parse("2026-09-09T18:20:00Z"),
            "corr-duplicate",
            "cause-duplicate",
            "incoming");
        var downstream = new TestIntegrationEvent(
            Guid.NewGuid(),
            DateTimeOffset.Parse("2026-09-09T18:20:01Z"),
            incoming.CorrelationId,
            incoming.EventId.ToString("D"),
            "downstream");

        await using var context = new AccountingDbContext(options);
        var inbox = new AccountingInbox(context, new FixedTimeProvider(incoming.OccurredOnUtc));
        var calls = 0;

        Task Handler(AccountingDbContext db, CancellationToken _)
        {
            calls++;
            new AccountingOutbox(db).Enqueue(downstream);
            return Task.CompletedTask;
        }

        var first = await inbox.ExecuteOnceAsync("Accounting.LedgerProjection", incoming, Handler);
        var duplicate = await inbox.ExecuteOnceAsync("Accounting.LedgerProjection", incoming, Handler);

        Assert.Equal(InboxConsumeResult.Processed, first);
        Assert.Equal(InboxConsumeResult.Duplicate, duplicate);
        Assert.Equal(1, calls);

        context.ChangeTracker.Clear();
        var receipt = Assert.Single(await context.InboxMessages.AsNoTracking().ToListAsync());
        Assert.Equal(InboxMessageStatus.Processed, receipt.Status);
        Assert.Equal(1, receipt.Attempts);
        Assert.Equal("corr-duplicate", receipt.CorrelationId);
        Assert.Equal("cause-duplicate", receipt.CausationId);
        Assert.Single(await context.OutboxMessages.AsNoTracking().ToListAsync());
    }

    [Fact]
    public async Task Inbox_FailedDeliveryCanRetryAndPreservesAttemptCount()
    {
        var options = CreateOptions();
        var incoming = new TestIntegrationEvent(
            Guid.NewGuid(),
            DateTimeOffset.Parse("2026-09-09T18:30:00Z"),
            null,
            null,
            "retry-inbox");

        await using var context = new AccountingDbContext(options);
        var inbox = new AccountingInbox(context, new FixedTimeProvider(incoming.OccurredOnUtc));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            inbox.ExecuteOnceAsync(
                "Accounting.RetryingConsumer",
                incoming,
                (_, _) => throw new InvalidOperationException("temporary failure")));

        context.ChangeTracker.Clear();
        var failed = await context.InboxMessages.SingleAsync();
        Assert.Equal(InboxMessageStatus.Failed, failed.Status);
        Assert.Equal(1, failed.Attempts);
        Assert.Equal("temporary failure", failed.LastError);

        context.ChangeTracker.Clear();
        var calls = 0;
        var result = await inbox.ExecuteOnceAsync(
            "Accounting.RetryingConsumer",
            incoming,
            (_, _) =>
            {
                calls++;
                return Task.CompletedTask;
            });

        Assert.Equal(InboxConsumeResult.Processed, result);
        Assert.Equal(1, calls);

        context.ChangeTracker.Clear();
        var processed = await context.InboxMessages.SingleAsync();
        Assert.Equal(InboxMessageStatus.Processed, processed.Status);
        Assert.Equal(2, processed.Attempts);
        Assert.Null(processed.LastError);
    }

    [Fact]
    public void AccountingMessagingModel_UsesModuleSchemaAndCompositeInboxReceiptKey()
    {
        using var context = new AccountingDbContext(CreateOptions());
        var inbox = context.Model.FindEntityType(typeof(InboxMessage));
        var outbox = context.Model.FindEntityType(typeof(OutboxMessage));

        Assert.NotNull(inbox);
        Assert.NotNull(outbox);
        Assert.Equal(AccountingDbContext.Schema, inbox!.GetSchema());
        Assert.Equal(AccountingDbContext.Schema, outbox!.GetSchema());
        Assert.Equal("InboxMessages", inbox.GetTableName());
        Assert.Equal("OutboxMessages", outbox.GetTableName());
        Assert.Equal(
            new[] { nameof(InboxMessage.ConsumerName), nameof(InboxMessage.EventId) },
            inbox.FindPrimaryKey()!.Properties.Select(property => property.Name).ToArray());
        Assert.True(inbox.FindProperty(nameof(InboxMessage.RowVersion))!.IsConcurrencyToken);
        Assert.True(outbox.FindProperty(nameof(OutboxMessage.RowVersion))!.IsConcurrencyToken);
    }

    private static DbContextOptions<AccountingDbContext> CreateOptions() =>
        new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

    private sealed record TestIntegrationEvent : IntegrationEvent
    {
        public TestIntegrationEvent(
            Guid eventId,
            DateTimeOffset occurredOnUtc,
            string? correlationId,
            string? causationId,
            string value)
            : base(eventId, occurredOnUtc, correlationId, causationId)
        {
            Value = value;
        }

        public override string EventName => "accounting.test.v1";
        public string Value { get; }
    }

    private sealed class FixedTimeProvider(DateTimeOffset nowUtc) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => nowUtc;
    }
}
