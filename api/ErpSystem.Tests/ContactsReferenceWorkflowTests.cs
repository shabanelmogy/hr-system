using System.Text.Json;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Application.Parties;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure.Parties;
using ErpSystem.Modules.Contacts.Application.Parties;
using ErpSystem.Modules.Contacts.Contracts;
using ErpSystem.Modules.Contacts.Domain;
using ErpSystem.Modules.Contacts.Infrastructure;
using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using ErpSystem.Modules.Contacts.Infrastructure.Parties;
using Microsoft.EntityFrameworkCore;
using AccountingInboxStatus = ErpSystem.Modules.Accounting.Infrastructure.Messaging.InboxMessageStatus;
using ContactsOutboxStatus = ErpSystem.Modules.Contacts.Infrastructure.Messaging.OutboxMessageStatus;

namespace ErpSystem.Tests;

public sealed class ContactsReferenceWorkflowTests
{
    [Fact]
    public async Task ContactsOutboxPayload_FlowsThroughPublicContractIntoAccountingInboxProjection()
    {
        var contactsActor = new TestExecutionContext("user-1", "tenant-1", 7);
        PartyCreatedIntegrationEvent publishedContract;

        await using (var contacts = new ContactsDbContext(
                         ContactsOptions(Guid.NewGuid().ToString("N")),
                         contactsActor))
        {
            var store = new PartyStore(contacts);
            var create = new CreatePartyCommandHandler(
                store,
                contactsActor,
                new ContactsOutbox(contacts),
                new FixedTimeProvider(DateTimeOffset.Parse("2026-09-09T19:50:00Z")));

            await create.Handle(
                new CreatePartyCommand("Cross Module Party", "flow@example.com", null, "flow-correlation"),
                CancellationToken.None);

            var message = await contacts.OutboxMessages.AsNoTracking().SingleAsync();
            publishedContract = JsonSerializer.Deserialize<PartyCreatedIntegrationEvent>(
                                    message.Payload,
                                    new JsonSerializerOptions(JsonSerializerDefaults.Web))
                                ?? throw new InvalidOperationException("Could not deserialize Contacts party event.");
        }

        await using var accounting = new AccountingDbContext(AccountingOptions());
        var consumer = new AccountingPartyIntegrationConsumer(
            new AccountingInbox(accounting, new FixedTimeProvider(DateTimeOffset.Parse("2026-09-09T19:51:00Z"))),
            new AccountingPartyReferenceStore(accounting));

        Assert.Equal(IntegrationEventConsumeResult.Processed, await consumer.ConsumeAsync(publishedContract));
        var reference = await accounting.PartyReferences.AsNoTracking().SingleAsync();
        Assert.Equal(publishedContract.PartyId, reference.PartyId);
        Assert.Equal("tenant-1", reference.TenantId);
        Assert.Equal(7, reference.CompanyId);
        Assert.Equal("Cross Module Party", reference.DisplayName);
        Assert.Equal("flow-correlation", publishedContract.CorrelationId);
    }

    [Fact]
    public async Task PartyCrud_IsTenantCompanyScoped_AndWritesTransactionalOutboxFacts()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var options = ContactsOptions(databaseName);
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        var now = DateTimeOffset.Parse("2026-09-09T20:00:00Z");

        Guid partyId;
        await using (var context = new ContactsDbContext(options, actor))
        {
            var store = new PartyStore(context);
            var outbox = new ContactsOutbox(context);
            var create = new CreatePartyCommandHandler(store, actor, outbox, new FixedTimeProvider(now));
            var created = await create.Handle(
                new CreatePartyCommand(
                    "Acme Contact",
                    "contact@example.com",
                    "+201000000000",
                    "corr-create",
                    "cause-create"),
                CancellationToken.None);
            partyId = created.Id;

            Assert.Single(await context.Parties.AsNoTracking().ToListAsync());
            var createdFact = Assert.Single(await context.OutboxMessages.AsNoTracking().ToListAsync());
            Assert.Equal("contacts.party.created", createdFact.EventName);
            Assert.Equal("corr-create", createdFact.CorrelationId);
            Assert.Equal("cause-create", createdFact.CausationId);
            Assert.Contains("tenant-1", createdFact.Payload, StringComparison.Ordinal);
            Assert.Contains("\"companyId\":7", createdFact.Payload, StringComparison.Ordinal);

            var update = new UpdatePartyCommandHandler(store, actor, outbox, new FixedTimeProvider(now.AddMinutes(1)));
            var updated = await update.Handle(
                new UpdatePartyCommand(
                    partyId,
                    "Acme Primary Contact",
                    "primary@example.com",
                    null,
                    "corr-update",
                    createdFact.EventId.ToString("D")),
                CancellationToken.None);

            Assert.NotNull(updated);
            Assert.Equal("Acme Primary Contact", updated!.DisplayName);
            Assert.Equal(2, await context.OutboxMessages.CountAsync());
            Assert.Contains(
                await context.OutboxMessages.AsNoTracking().ToListAsync(),
                message => message.EventName == "contacts.party.updated" &&
                           message.CorrelationId == "corr-update" &&
                           message.CausationId == createdFact.EventId.ToString("D"));
        }

        await using (var otherTenant = new ContactsDbContext(
                         options,
                         new TestExecutionContext("user-2", "tenant-2", 7)))
        {
            var response = await new GetPartyQueryHandler(new PartyStore(otherTenant), new TestExecutionContext("user-2", "tenant-2", 7))
                .Handle(new GetPartyQuery(partyId), CancellationToken.None);
            Assert.Null(response);
        }

        var otherCompanyActor = new TestExecutionContext("user-3", "tenant-1", 8);
        await using (var otherCompany = new ContactsDbContext(options, otherCompanyActor))
        {
            var response = await new GetPartyQueryHandler(new PartyStore(otherCompany), otherCompanyActor)
                .Handle(new GetPartyQuery(partyId), CancellationToken.None);
            Assert.Null(response);
        }
    }

    [Fact]
    public async Task ContactsDbContext_RejectsCrossScopeWrites()
    {
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        await using var context = new ContactsDbContext(ContactsOptions(Guid.NewGuid().ToString("N")), actor);
        context.Parties.Add(Party.Create(
            Guid.NewGuid(),
            "tenant-2",
            7,
            "Wrong tenant",
            null,
            null,
            DateTimeOffset.UtcNow));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => context.SaveChangesAsync());
        Assert.Contains("Cross-tenant", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ContactsOutbox_FailureCanBeRetriedWithoutLosingAttemptState()
    {
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        await using var context = new ContactsDbContext(
            ContactsOptions(Guid.NewGuid().ToString("N")),
            actor);
        var outbox = new ContactsOutbox(context);
        var eventId = Guid.NewGuid();
        var firstAttempt = DateTimeOffset.Parse("2026-09-09T20:10:00Z");
        var retryAt = firstAttempt.AddMinutes(2);
        outbox.Enqueue(new PartyCreatedIntegrationEvent(
            Guid.NewGuid(), "tenant-1", 7, "Retry Party", null, null,
            eventId, firstAttempt.AddMinutes(-1), "corr", "cause"));
        await context.SaveChangesAsync();

        var first = Assert.Single(await outbox.ClaimDueAsync(firstAttempt, 10));
        Assert.Equal(1, first.Attempts);
        Assert.Equal(ContactsOutboxStatus.Processing, first.Status);
        await outbox.MarkFailedAsync(eventId, "temporary transport failure", retryAt);

        Assert.Empty(await outbox.ClaimDueAsync(retryAt.AddTicks(-1), 10));
        var second = Assert.Single(await outbox.ClaimDueAsync(retryAt, 10));
        Assert.Equal(2, second.Attempts);
        await outbox.MarkPublishedAsync(eventId, retryAt.AddSeconds(1));

        context.ChangeTracker.Clear();
        var persisted = await context.OutboxMessages.SingleAsync(message => message.EventId == eventId);
        Assert.Equal(ContactsOutboxStatus.Published, persisted.Status);
        Assert.Equal(2, persisted.Attempts);
    }

    [Fact]
    public async Task AccountingPartyConsumer_DuplicateDeliveryDoesNotDuplicateProjection_AndUpdateRefreshesIt()
    {
        var options = AccountingOptions();
        await using var context = new AccountingDbContext(options);
        var inbox = new AccountingInbox(context, new FixedTimeProvider(DateTimeOffset.Parse("2026-09-09T20:20:00Z")));
        var store = new AccountingPartyReferenceStore(context);
        var consumer = new AccountingPartyIntegrationConsumer(inbox, store);
        var partyId = Guid.NewGuid();
        var created = new PartyCreatedIntegrationEvent(
            partyId, "tenant-1", 7, "Original", "one@example.com", null,
            Guid.NewGuid(), DateTimeOffset.Parse("2026-09-09T20:19:00Z"), "corr", "cause");

        Assert.Equal(IntegrationEventConsumeResult.Processed, await consumer.ConsumeAsync(created));
        Assert.Equal(IntegrationEventConsumeResult.Duplicate, await consumer.ConsumeAsync(created));
        Assert.Single(await context.PartyReferences.AsNoTracking().ToListAsync());

        var updated = new PartyUpdatedIntegrationEvent(
            partyId, "tenant-1", 7, "Updated", "two@example.com", "+2011",
            Guid.NewGuid(), created.OccurredOnUtc.AddMinutes(1), "corr", created.EventId.ToString("D"));
        Assert.Equal(IntegrationEventConsumeResult.Processed, await consumer.ConsumeAsync(updated));

        context.ChangeTracker.Clear();
        var reference = await context.PartyReferences.SingleAsync();
        Assert.Equal("Updated", reference.DisplayName);
        Assert.Equal("two@example.com", reference.Email);
        Assert.Equal(updated.EventId, reference.SourceEventId);
        Assert.Equal(2, await context.InboxMessages.CountAsync());
    }

    [Fact]
    public async Task AccountingPartyConsumer_FailedDeliveryIsRecordedAndRetrySucceeds()
    {
        var options = AccountingOptions();
        await using var context = new AccountingDbContext(options);
        var inbox = new AccountingInbox(context, new FixedTimeProvider(DateTimeOffset.Parse("2026-09-09T20:30:00Z")));
        var realStore = new AccountingPartyReferenceStore(context);
        var failingStore = new FailOncePartyReferenceStore(realStore);
        var consumer = new AccountingPartyIntegrationConsumer(inbox, failingStore);
        var incoming = new PartyCreatedIntegrationEvent(
            Guid.NewGuid(), "tenant-1", 7, "Retry Consumer", null, null,
            Guid.NewGuid(), DateTimeOffset.Parse("2026-09-09T20:29:00Z"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => consumer.ConsumeAsync(incoming));
        context.ChangeTracker.Clear();
        var failed = await context.InboxMessages.SingleAsync();
        Assert.Equal(AccountingInboxStatus.Failed, failed.Status);
        Assert.Equal(1, failed.Attempts);
        Assert.Empty(await context.PartyReferences.AsNoTracking().ToListAsync());

        Assert.Equal(IntegrationEventConsumeResult.Processed, await consumer.ConsumeAsync(incoming));
        context.ChangeTracker.Clear();
        var processed = await context.InboxMessages.SingleAsync();
        Assert.Equal(AccountingInboxStatus.Processed, processed.Status);
        Assert.Equal(2, processed.Attempts);
        Assert.Single(await context.PartyReferences.AsNoTracking().ToListAsync());
    }

    private static DbContextOptions<ContactsDbContext> ContactsOptions(string databaseName) =>
        new DbContextOptionsBuilder<ContactsDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

    private static DbContextOptions<AccountingDbContext> AccountingOptions() =>
        new DbContextOptionsBuilder<AccountingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

    private sealed record TestExecutionContext(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentExecutionContext;

    private sealed class FixedTimeProvider(DateTimeOffset nowUtc) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => nowUtc;
    }

    private sealed class FailOncePartyReferenceStore(IAccountingPartyReferenceStore inner)
        : IAccountingPartyReferenceStore
    {
        private bool _shouldFail = true;

        public Task UpsertAsync(
            AccountingPartyReferenceUpdate update,
            CancellationToken cancellationToken = default)
        {
            if (_shouldFail)
            {
                _shouldFail = false;
                throw new InvalidOperationException("temporary projection failure");
            }

            return inner.UpsertAsync(update, cancellationToken);
        }
    }
}
