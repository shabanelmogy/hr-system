using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting;
using ErpSystem.Modules.Accounting.Application.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using ErpSystem.Modules.Contacts.Application.Messaging;
using ErpSystem.Modules.Contacts.Application.Parties;
using ErpSystem.Modules.Contacts.Infrastructure;
using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using ErpSystem.Modules.Contacts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

public sealed class OutboxCompositionTests
{
    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void ModuleOutboxes_RemainOwnedWhenRegistrationOrderChanges(bool contactsFirst)
    {
        using var provider = BuildProvider(contactsFirst);
        using var scope = provider.CreateScope();

        var contactsOutbox = scope.ServiceProvider.GetRequiredService<IContactsOutbox>();
        var accountingOutbox = scope.ServiceProvider.GetRequiredService<IAccountingOutbox>();
        var accountingInbox = scope.ServiceProvider.GetRequiredService<IAccountingInbox>();

        Assert.IsType<ContactsOutbox>(contactsOutbox);
        Assert.IsType<AccountingOutbox>(accountingOutbox);
        Assert.IsType<AccountingInbox>(accountingInbox);
        Assert.Same(
            scope.ServiceProvider.GetRequiredService<ContactsOutbox>(),
            contactsOutbox);
        Assert.Same(
            scope.ServiceProvider.GetRequiredService<AccountingOutbox>(),
            accountingOutbox);
        Assert.Same(
            scope.ServiceProvider.GetRequiredService<AccountingInbox>(),
            accountingInbox);

        Assert.IsType<CreatePartyCommandHandler>(
            scope.ServiceProvider.GetRequiredService<
                MediatR.IRequestHandler<CreatePartyCommand, PartyResponse>>());

        // The unqualified contract remains implemented by each concrete outbox,
        // but is deliberately not registered when multiple modules are composed.
        // This makes accidental last-registration wins impossible.
        Assert.Null(scope.ServiceProvider.GetService<IIntegrationEventOutbox>());
        Assert.Null(scope.ServiceProvider.GetService<IIntegrationEventInbox>());
    }

    [Fact]
    public async Task ContactsPartyAndOutbox_AreNotPersistedWhenScopeValidationRejectsWrite()
    {
        var options = new DbContextOptionsBuilder<ContactsDbContext>()
            .UseInMemoryDatabase($"ContactsOutboxScopeFailure_{Guid.NewGuid():N}")
            .Options;
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);

        await using (var context = new ContactsDbContext(options, actor))
        {
            var party = ErpSystem.Modules.Contacts.Domain.Party.Create(
                Guid.NewGuid(),
                "different-tenant",
                7,
                "Rejected Contact",
                null,
                null,
                DateTimeOffset.Parse("2026-09-11T10:00:00Z"));
            context.Parties.Add(party);
            new ContactsOutbox(context).Enqueue(new ErpSystem.Modules.Contacts.Contracts.PartyCreatedIntegrationEvent(
                party.Id,
                party.TenantId,
                party.CompanyId,
                party.DisplayName,
                party.Email,
                party.Phone,
                Guid.NewGuid(),
                party.CreatedOnUtc));

            await Assert.ThrowsAsync<InvalidOperationException>(() => context.SaveChangesAsync());
        }

        await using var observer = new ContactsDbContext(options, actor);
        Assert.Empty(await observer.Parties.IgnoreQueryFilters().ToListAsync());
        Assert.Empty(await observer.OutboxMessages.ToListAsync());
    }

    [SqlServerFact]
    public async Task ContactsPartyAndOutbox_RollBackTogetherOnConfiguredSqlServer()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ContactsOutboxAtomicity");
        var actor = new TestExecutionContext("user-1", "tenant-1", 7);
        await using var provider = BuildContactsProvider(database.ConnectionString, actor);
        await using (var scope = provider.CreateAsyncScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ContactsDbContext>();
            await context.Database.EnsureCreatedAsync();
            await using var transaction = await context.Database.BeginTransactionAsync();

            var handler = scope.ServiceProvider.GetRequiredService<
                MediatR.IRequestHandler<CreatePartyCommand, PartyResponse>>();

            await handler.Handle(
                new CreatePartyCommand("Atomic Contact", "atomic@example.com", null),
                CancellationToken.None);

            Assert.Equal(1, await context.Parties.CountAsync());
            Assert.Equal(1, await context.OutboxMessages.CountAsync());

            await transaction.RollbackAsync();
        }

        await using var observerScope = provider.CreateAsyncScope();
        var observer = observerScope.ServiceProvider.GetRequiredService<ContactsDbContext>();
        Assert.Empty(await observer.Parties.IgnoreQueryFilters().ToListAsync());
        Assert.Empty(await observer.OutboxMessages.ToListAsync());
    }

    private static ServiceProvider BuildProvider(bool contactsFirst)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Contacts"] =
                    "Server=(local);Database=ContactsCompositionTests;Trusted_Connection=True;",
                ["ConnectionStrings:Accounting"] =
                    "Server=(local);Database=AccountingCompositionTests;Trusted_Connection=True;",
            })
            .Build();

        var services = new ServiceCollection();
        services.AddSingleton<ICurrentExecutionContext>(
            new TestExecutionContext("user-1", "tenant-1", 7));
        var contactsModule = new ContactsModule();
        var accountingModule = new AccountingModule();

        if (contactsFirst)
        {
            contactsModule.RegisterServices(services, configuration);
            accountingModule.RegisterServices(services, configuration);
        }
        else
        {
            accountingModule.RegisterServices(services, configuration);
            contactsModule.RegisterServices(services, configuration);
        }

        return services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateScopes = true,
        });
    }

    private static ServiceProvider BuildContactsProvider(
        string connectionString,
        ICurrentExecutionContext executionContext)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Contacts"] = connectionString,
            })
            .Build();

        var services = new ServiceCollection();
        services.AddSingleton(executionContext);
        services.AddSingleton<TimeProvider>(
            new FixedTimeProvider(DateTimeOffset.Parse("2026-09-11T10:00:00Z")));
        new ContactsModule().RegisterServices(services, configuration);

        return services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateScopes = true,
        });
    }


    private sealed record TestExecutionContext(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentExecutionContext;

    private sealed class FixedTimeProvider(DateTimeOffset nowUtc) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => nowUtc;
    }

}

