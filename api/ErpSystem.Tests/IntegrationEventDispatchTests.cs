using System.Reflection;
using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Application.Parties;
using ErpSystem.Modules.Accounting.Application.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure.Parties;
using ErpSystem.Modules.Contacts.Contracts;
using ErpSystem.Modules.Contacts.Infrastructure;
using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using ErpSystem.Modules.Contacts.Presentation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using AccountingOutboxStatus = ErpSystem.Modules.Accounting.Infrastructure.Messaging.OutboxMessageStatus;
using ContactsOutboxStatus = ErpSystem.Modules.Contacts.Infrastructure.Messaging.OutboxMessageStatus;

namespace ErpSystem.Tests;

public sealed class IntegrationEventDispatchTests
{
    [Fact]
    public async Task ContactsDispatcher_AutomaticallyPublishesThroughInboxIntoAccountingProjection()
    {
        var now = DateTimeOffset.Parse("2026-09-09T20:40:00Z");
        var clock = new MutableTimeProvider(now);
        var accountingDatabase = Guid.NewGuid().ToString("N");
        var services = CreateAccountingDispatchServices(accountingDatabase, clock);

        await using var provider = services.BuildServiceProvider();
        await using var scope = provider.CreateAsyncScope();
        var publisher = scope.ServiceProvider.GetRequiredService<IIntegrationEventPublisher>();

        var contactsOptions = ContactsOptions(Guid.NewGuid().ToString("N"));
        await using var contacts = new ContactsDbContext(
            contactsOptions,
            new TestExecutionContext("user-1", "tenant-1", 7));
        var outbox = new ContactsOutbox(contacts);
        var eventId = Guid.NewGuid();
        var partyId = Guid.NewGuid();
        outbox.Enqueue(new PartyCreatedIntegrationEvent(
            partyId,
            "tenant-1",
            7,
            "Automatic Party",
            "auto@example.com",
            "+201000000001",
            eventId,
            now.AddSeconds(-1),
            "correlation-auto",
            "causation-auto"));
        await contacts.SaveChangesAsync();

        var dispatcher = new ContactsOutboxDispatcher(
            outbox,
            publisher,
            clock,
            Options.Create(new ContactsOutboxDispatcherOptions()));

        Assert.Equal(1, await dispatcher.DispatchOnceAsync());

        contacts.ChangeTracker.Clear();
        var persistedOutbox = await contacts.OutboxMessages.SingleAsync();
        Assert.Equal(ContactsOutboxStatus.Published, persistedOutbox.Status);
        Assert.Equal(1, persistedOutbox.Attempts);

        var accounting = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();
        accounting.ChangeTracker.Clear();
        var reference = await accounting.PartyReferences.AsNoTracking().SingleAsync();
        Assert.Equal(partyId, reference.PartyId);
        Assert.Equal("tenant-1", reference.TenantId);
        Assert.Equal(7, reference.CompanyId);
        Assert.Equal("Automatic Party", reference.DisplayName);
        Assert.Equal(eventId, reference.SourceEventId);

        var receipt = await accounting.InboxMessages.AsNoTracking().SingleAsync();
        Assert.Equal(eventId, receipt.EventId);
        Assert.Equal("correlation-auto", receipt.CorrelationId);
        Assert.Equal("causation-auto", receipt.CausationId);
    }

    [Fact]
    public async Task InProcessPublisher_WithNoConsumer_FailsInsteadOfSilentlyLosingFact()
    {
        var services = new ServiceCollection();
        services.AddHostSharedRuntime();
        await using var provider = services.BuildServiceProvider();
        await using var scope = provider.CreateAsyncScope();
        var publisher = scope.ServiceProvider.GetRequiredService<IIntegrationEventPublisher>();
        var integrationEvent = new PartyCreatedIntegrationEvent(
            Guid.NewGuid(),
            "tenant-1",
            7,
            "Unrouted Party",
            null,
            null,
            Guid.NewGuid(),
            DateTimeOffset.Parse("2026-09-09T20:45:00Z"));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            publisher.PublishAsync(integrationEvent));

        Assert.Contains("No integration-event handler", exception.Message, StringComparison.Ordinal);
        Assert.Contains(PartyCreatedIntegrationEvent.EventNameValue, exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ContactsDispatcher_FailureSurvivesRestartAndRetryPublishesStableEventId()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var options = ContactsOptions(databaseName);
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        var firstAttempt = DateTimeOffset.Parse("2026-09-09T20:50:00Z");
        var eventId = Guid.NewGuid();
        var dispatcherOptions = new ContactsOutboxDispatcherOptions
        {
            MaxAttempts = 3,
            BaseRetryDelay = TimeSpan.FromMinutes(1),
            MaxRetryDelay = TimeSpan.FromMinutes(4)
        };

        await using (var firstContext = new ContactsDbContext(options, actor))
        {
            var firstOutbox = new ContactsOutbox(firstContext);
            firstOutbox.Enqueue(new PartyCreatedIntegrationEvent(
                Guid.NewGuid(), "tenant-1", 7, "Restart Party", null, null,
                eventId, firstAttempt.AddSeconds(-1), "restart-correlation", null));
            await firstContext.SaveChangesAsync();

            var firstDispatcher = new ContactsOutboxDispatcher(
                firstOutbox,
                new AlwaysFailPublisher("Accounting unavailable"),
                new MutableTimeProvider(firstAttempt),
                Options.Create(dispatcherOptions));

            Assert.Equal(1, await firstDispatcher.DispatchOnceAsync());
            firstContext.ChangeTracker.Clear();
            var failed = await firstContext.OutboxMessages.SingleAsync();
            Assert.Equal(ContactsOutboxStatus.Failed, failed.Status);
            Assert.Equal(1, failed.Attempts);
            Assert.Equal(firstAttempt.AddMinutes(1), failed.NextAttemptOnUtc);
        }

        // New DbContext + new dispatcher instance models a host/process restart.
        var retryAt = firstAttempt.AddMinutes(1);
        var capture = new CapturingPublisher();
        await using (var restartedContext = new ContactsDbContext(options, actor))
        {
            var restartedOutbox = new ContactsOutbox(restartedContext);
            var restartedDispatcher = new ContactsOutboxDispatcher(
                restartedOutbox,
                capture,
                new MutableTimeProvider(retryAt),
                Options.Create(dispatcherOptions));

            Assert.Equal(1, await restartedDispatcher.DispatchOnceAsync());
            var published = Assert.Single(capture.Events);
            Assert.Equal(eventId, published.EventId);

            restartedContext.ChangeTracker.Clear();
            var persisted = await restartedContext.OutboxMessages.SingleAsync();
            Assert.Equal(ContactsOutboxStatus.Published, persisted.Status);
            Assert.Equal(2, persisted.Attempts);
            Assert.Null(persisted.NextAttemptOnUtc);
        }
    }

    [Fact]
    public async Task ContactsOutbox_ReclaimsOnlyStaleProcessingMessageAfterDispatcherInterruption()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var options = ContactsOptions(databaseName);
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        var claimedOn = DateTimeOffset.Parse("2026-09-09T21:00:00Z");
        var timeout = TimeSpan.FromMinutes(5);

        await using (var interrupted = new ContactsDbContext(options, actor))
        {
            var outbox = new ContactsOutbox(interrupted);
            outbox.Enqueue(new PartyCreatedIntegrationEvent(
                Guid.NewGuid(), "tenant-1", 7, "Interrupted", null, null,
                Guid.NewGuid(), claimedOn.AddSeconds(-1)));
            await interrupted.SaveChangesAsync();
            var claimed = Assert.Single(await outbox.ClaimDueAsync(claimedOn, 1, timeout));
            Assert.Equal(ContactsOutboxStatus.Processing, claimed.Status);
            Assert.Equal(1, claimed.Attempts);
            // Simulate process termination before publish/complete.
        }

        await using (var tooEarly = new ContactsDbContext(options, actor))
        {
            var outbox = new ContactsOutbox(tooEarly);
            Assert.Empty(await outbox.ClaimDueAsync(claimedOn + timeout - TimeSpan.FromTicks(1), 1, timeout));
        }

        await using (var recovered = new ContactsDbContext(options, actor))
        {
            var outbox = new ContactsOutbox(recovered);
            var reclaimed = Assert.Single(await outbox.ClaimDueAsync(claimedOn + timeout, 1, timeout));
            Assert.Equal(ContactsOutboxStatus.Processing, reclaimed.Status);
            Assert.Equal(2, reclaimed.Attempts);
        }
    }

    [Fact]
    public async Task ContactsDispatcher_CrashAfterConsumerCommit_RedeliversWithoutDuplicateBusinessEffect()
    {
        var claimedOn = DateTimeOffset.Parse("2026-09-09T21:05:00Z");
        var timeout = TimeSpan.FromMinutes(5);
        var clock = new MutableTimeProvider(claimedOn);
        var services = CreateAccountingDispatchServices(Guid.NewGuid().ToString("N"), clock);
        await using var provider = services.BuildServiceProvider();
        await using var scope = provider.CreateAsyncScope();
        var publisher = scope.ServiceProvider.GetRequiredService<IIntegrationEventPublisher>();

        var databaseName = Guid.NewGuid().ToString("N");
        var options = ContactsOptions(databaseName);
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        var integrationEvent = new PartyCreatedIntegrationEvent(
            Guid.NewGuid(),
            "tenant-1",
            7,
            "Crash Window Party",
            null,
            null,
            Guid.NewGuid(),
            claimedOn.AddSeconds(-1),
            "crash-window-correlation");

        await using (var interrupted = new ContactsDbContext(options, actor))
        {
            var outbox = new ContactsOutbox(interrupted);
            outbox.Enqueue(integrationEvent);
            await interrupted.SaveChangesAsync();

            Assert.Single(await outbox.ClaimDueAsync(claimedOn, 1, timeout));
            // Delivery and Accounting transaction commit succeed, then the
            // producer process dies before MarkPublishedAsync can run.
            await publisher.PublishAsync(integrationEvent);
        }

        clock.Advance(timeout);
        await using (var restarted = new ContactsDbContext(options, actor))
        {
            var outbox = new ContactsOutbox(restarted);
            var dispatcher = new ContactsOutboxDispatcher(
                outbox,
                publisher,
                clock,
                Options.Create(new ContactsOutboxDispatcherOptions
                {
                    ProcessingTimeout = timeout
                }));

            Assert.Equal(1, await dispatcher.DispatchOnceAsync());
            restarted.ChangeTracker.Clear();
            var completed = await restarted.OutboxMessages.SingleAsync();
            Assert.Equal(ContactsOutboxStatus.Published, completed.Status);
            Assert.Equal(2, completed.Attempts);
        }

        var accounting = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();
        accounting.ChangeTracker.Clear();
        Assert.Single(await accounting.PartyReferences.AsNoTracking().ToListAsync());
        var receipt = Assert.Single(await accounting.InboxMessages.AsNoTracking().ToListAsync());
        Assert.Equal(integrationEvent.EventId, receipt.EventId);
        Assert.Equal(1, receipt.Attempts);
    }

    [Fact]
    public async Task ContactsDispatcher_StopsAtMaxAttemptsAndDeadLettersMessage()
    {
        var options = ContactsOptions(Guid.NewGuid().ToString("N"));
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        var clock = new MutableTimeProvider(DateTimeOffset.Parse("2026-09-09T21:10:00Z"));
        var dispatcherOptions = new ContactsOutboxDispatcherOptions
        {
            MaxAttempts = 2,
            BaseRetryDelay = TimeSpan.FromSeconds(10),
            MaxRetryDelay = TimeSpan.FromSeconds(10)
        };

        await using var context = new ContactsDbContext(options, actor);
        var outbox = new ContactsOutbox(context);
        outbox.Enqueue(new PartyCreatedIntegrationEvent(
            Guid.NewGuid(), "tenant-1", 7, "Dead Letter", null, null,
            Guid.NewGuid(), clock.GetUtcNow().AddSeconds(-1)));
        await context.SaveChangesAsync();

        var dispatcher = new ContactsOutboxDispatcher(
            outbox,
            new AlwaysFailPublisher("permanent downstream failure"),
            clock,
            Options.Create(dispatcherOptions));

        Assert.Equal(1, await dispatcher.DispatchOnceAsync());
        clock.Advance(TimeSpan.FromSeconds(10));
        Assert.Equal(1, await dispatcher.DispatchOnceAsync());

        context.ChangeTracker.Clear();
        var dead = await context.OutboxMessages.SingleAsync();
        Assert.Equal(ContactsOutboxStatus.Dead, dead.Status);
        Assert.Equal(2, dead.Attempts);
        Assert.Null(dead.NextAttemptOnUtc);
        Assert.Contains("permanent downstream failure", dead.LastError, StringComparison.Ordinal);

        clock.Advance(TimeSpan.FromHours(1));
        Assert.Equal(0, await dispatcher.DispatchOnceAsync());
    }

    [Fact]
    public void ContactsPartiesApi_RequiresAuthenticationAndKeepsStableRoute()
    {
        var controller = typeof(PartiesController);
        Assert.NotEmpty(controller.GetCustomAttributes<AuthorizeAttribute>(inherit: true));
        Assert.Empty(controller.GetCustomAttributes<AllowAnonymousAttribute>(inherit: true));

        var route = Assert.Single(controller.GetCustomAttributes<RouteAttribute>(inherit: true));
        Assert.Equal("api/v1/contacts/parties", route.Template);
    }

    private static ServiceCollection CreateAccountingDispatchServices(
        string databaseName,
        TimeProvider timeProvider)
    {
        var services = new ServiceCollection();
        services.AddHostSharedRuntime();
        services.AddSingleton(timeProvider);
        services.AddDbContext<AccountingDbContext>(options => options.UseInMemoryDatabase(databaseName));
        services.AddScoped<AccountingInbox>();
        services.AddScoped<IAccountingInbox>(provider => provider.GetRequiredService<AccountingInbox>());
        services.AddScoped<IAccountingPartyReferenceStore, AccountingPartyReferenceStore>();
        services.AddScoped<AccountingPartyIntegrationConsumer>();
        services.AddScoped<IIntegrationEventHandler<PartyCreatedIntegrationEvent>>(provider =>
            provider.GetRequiredService<AccountingPartyIntegrationConsumer>());
        services.AddScoped<IIntegrationEventHandler<PartyUpdatedIntegrationEvent>>(provider =>
            provider.GetRequiredService<AccountingPartyIntegrationConsumer>());
        return services;
    }

    private static DbContextOptions<ContactsDbContext> ContactsOptions(string databaseName) =>
        new DbContextOptionsBuilder<ContactsDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

    private sealed record TestExecutionContext(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentExecutionContext;

    private sealed class MutableTimeProvider(DateTimeOffset nowUtc) : TimeProvider
    {
        private DateTimeOffset _nowUtc = nowUtc;
        public override DateTimeOffset GetUtcNow() => _nowUtc;
        public void Advance(TimeSpan value) => _nowUtc += value;
    }

    private sealed class AlwaysFailPublisher(string message) : IIntegrationEventPublisher
    {
        public Task PublishAsync(
            IntegrationEvent integrationEvent,
            CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(message);
    }

    private sealed class CapturingPublisher : IIntegrationEventPublisher
    {
        public List<IntegrationEvent> Events { get; } = [];

        public Task PublishAsync(
            IntegrationEvent integrationEvent,
            CancellationToken cancellationToken = default)
        {
            Events.Add(integrationEvent);
            return Task.CompletedTask;
        }
    }
}
