using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Contacts.Contracts;
using ErpSystem.Modules.Contacts.Infrastructure;
using ErpSystem.Modules.Contacts.Infrastructure.Health;
using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Tests;

public sealed class ContactsOutboxHealthCheckTests
{
    [Fact]
    public void Options_RejectUnsafeHealthThresholds()
    {
        var negativeDeadRows = new ContactsOutboxDispatcherOptions { MaxDeadRows = -1 };
        var zeroAge = new ContactsOutboxDispatcherOptions { MaxDueBacklogAge = TimeSpan.Zero };

        Assert.Throws<InvalidOperationException>(() => negativeDeadRows.Validate());
        Assert.Throws<InvalidOperationException>(() => zeroAge.Validate());
    }

    [Fact]
    public void Options_ReadHealthThresholdsFromModuleConfiguration()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [$"{ContactsOutboxDispatcherOptions.SectionName}:MaxDeadRows"] = "3",
                [$"{ContactsOutboxDispatcherOptions.SectionName}:MaxDueBacklogAge"] = "00:45:00"
            })
            .Build();

        var options = ContactsOutboxDispatcherOptions.FromConfiguration(configuration);

        Assert.Equal(3, options.MaxDeadRows);
        Assert.Equal(TimeSpan.FromMinutes(45), options.MaxDueBacklogAge);
    }

    [Fact]
    public void Infrastructure_RegistersContactsOutboxAsReadinessDependency()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Contacts"] =
                    "Server=(localdb)\\MSSQLLocalDB;Database=ContactsHealthRegistration;Integrated Security=True;"
            })
            .Build();
        var services = new ServiceCollection();

        services.AddContactsInfrastructure(configuration);

        using var provider = services.BuildServiceProvider();
        var registrations = provider
            .GetRequiredService<IOptions<HealthCheckServiceOptions>>()
            .Value.Registrations;
        var registration = Assert.Single(
            registrations,
            candidate => candidate.Name == "contacts-outbox");
        Assert.Contains("ready", registration.Tags);
    }

    [Fact]
    public async Task HealthCheck_IsHealthyWhenOutboxIsWithinThresholds()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        await using var provider = CreateProvider(databaseName);
        var check = CreateCheck(provider, new ContactsOutboxDispatcherOptions());

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Healthy, result.Status);
        Assert.Equal(0, result.Data["deadRows"]);
        Assert.Equal(0, result.Data["dueRows"]);
    }

    [Fact]
    public async Task HealthCheck_IsDegradedWhenDeadRowsExceedThreshold()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var now = DateTimeOffset.Parse("2026-09-11T12:00:00Z");
        await SeedDeadMessageAsync(databaseName, now);
        await using var provider = CreateProvider(databaseName);
        var check = CreateCheck(provider, new ContactsOutboxDispatcherOptions
        {
            MaxAttempts = 1,
            MaxDeadRows = 0
        }, now);

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Degraded, result.Status);
        Assert.Equal(1, result.Data["deadRows"]);
    }

    [Fact]
    public async Task HealthCheck_IsDegradedWhenDueBacklogIsOlderThanThreshold()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var now = DateTimeOffset.Parse("2026-09-11T12:00:00Z");
        var options = new DbContextOptionsBuilder<ContactsDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        await using (var context = new ContactsDbContext(options, new TestExecutionContext(null, null, null)))
        {
            new ContactsOutbox(context).Enqueue(new PartyCreatedIntegrationEvent(
                Guid.NewGuid(),
                "tenant-1",
                7,
                "Old due message",
                null,
                null,
                Guid.NewGuid(),
                now.AddHours(-2)));
            await context.SaveChangesAsync();
        }

        await using var provider = CreateProvider(databaseName, now);
        var check = CreateCheck(provider, new ContactsOutboxDispatcherOptions
        {
            MaxDueBacklogAge = TimeSpan.FromMinutes(30)
        }, now);

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Degraded, result.Status);
        Assert.Equal(1, result.Data["dueRows"]);
        Assert.True((long)result.Data["oldestDueAgeSeconds"] > 30 * 60);
    }

    [Fact]
    public async Task HealthCheck_CountsStaleProcessingRowsAsDueBacklog()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var claimedOnUtc = DateTimeOffset.Parse("2026-09-11T12:00:00Z");
        var options = new DbContextOptionsBuilder<ContactsDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        await using (var context = new ContactsDbContext(options, new TestExecutionContext(null, null, null)))
        {
            var outbox = new ContactsOutbox(context);
            outbox.Enqueue(new PartyCreatedIntegrationEvent(
                Guid.NewGuid(),
                "tenant-1",
                7,
                "Stale processing message",
                null,
                null,
                Guid.NewGuid(),
                claimedOnUtc));
            await context.SaveChangesAsync();
            Assert.Single(await outbox.ClaimDueAsync(
                claimedOnUtc,
                batchSize: 1,
                processingTimeout: TimeSpan.FromMinutes(5)));
        }

        var healthCheckOnUtc = claimedOnUtc.AddMinutes(10);
        await using var provider = CreateProvider(databaseName, healthCheckOnUtc);
        var check = CreateCheck(provider, new ContactsOutboxDispatcherOptions
        {
            ProcessingTimeout = TimeSpan.FromMinutes(5),
            MaxDueBacklogAge = TimeSpan.FromMinutes(5)
        }, healthCheckOnUtc);

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Degraded, result.Status);
        Assert.Equal(1, result.Data["dueRows"]);
        Assert.Equal(1, result.Data["staleProcessingRows"]);
    }

    [Fact]
    public async Task HealthCheck_IsUnhealthyWhenDatabaseQueryFails()
    {
        var check = new ContactsOutboxHealthCheck(
            new ThrowingScopeFactory(),
            Options.Create(new ContactsOutboxDispatcherOptions()),
            TimeProvider.System,
            NullLogger<ContactsOutboxHealthCheck>.Instance);

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.Empty(result.Data);
        Assert.DoesNotContain("connection", result.Description, StringComparison.OrdinalIgnoreCase);
    }

    private static ContactsOutboxHealthCheck CreateCheck(
        ServiceProvider provider,
        ContactsOutboxDispatcherOptions options,
        DateTimeOffset? now = null) =>
        new(
            provider.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(options),
            now is null ? TimeProvider.System : new FixedTimeProvider(now.Value),
            NullLogger<ContactsOutboxHealthCheck>.Instance);

    private static ServiceProvider CreateProvider(
        string databaseName,
        DateTimeOffset? now = null)
    {
        var services = new ServiceCollection();
        services.AddSingleton<ICurrentExecutionContext>(new TestExecutionContext(null, null, null));
        services.AddDbContext<ContactsDbContext>(options => options.UseInMemoryDatabase(databaseName));
        services.AddSingleton<TimeProvider>(now is null ? TimeProvider.System : new FixedTimeProvider(now.Value));
        return services.BuildServiceProvider();
    }

    private static async Task SeedDeadMessageAsync(string databaseName, DateTimeOffset now)
    {
        var options = new DbContextOptionsBuilder<ContactsDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        await using var context = new ContactsDbContext(options, new TestExecutionContext(null, null, null));
        var outbox = new ContactsOutbox(context);
        outbox.Enqueue(new PartyCreatedIntegrationEvent(
            Guid.NewGuid(),
            "tenant-1",
            7,
            "Dead message",
            null,
            null,
            Guid.NewGuid(),
            now.AddMinutes(-1)));
        await context.SaveChangesAsync();

        var dispatcher = new ContactsOutboxDispatcher(
            outbox,
            new AlwaysFailPublisher(),
            new FixedTimeProvider(now),
            Options.Create(new ContactsOutboxDispatcherOptions { MaxAttempts = 1 }));
        await dispatcher.DispatchOnceAsync();
    }

    private sealed record TestExecutionContext(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentExecutionContext;

    private sealed class FixedTimeProvider(DateTimeOffset nowUtc) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => nowUtc;
    }

    private sealed class AlwaysFailPublisher : IIntegrationEventPublisher
    {
        public Task PublishAsync(
            IntegrationEvent integrationEvent,
            CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("downstream unavailable");
    }

    private sealed class ThrowingScopeFactory : IServiceScopeFactory
    {
        public IServiceScope CreateScope() => new ThrowingScope();
    }

    private sealed class ThrowingScope : IServiceScope
    {
        public IServiceProvider ServiceProvider => new ThrowingServiceProvider();

        public void Dispose()
        {
        }
    }

    private sealed class ThrowingServiceProvider : IServiceProvider
    {
        public object? GetService(Type serviceType) =>
            throw new InvalidOperationException("Contacts database unavailable");
    }
}
