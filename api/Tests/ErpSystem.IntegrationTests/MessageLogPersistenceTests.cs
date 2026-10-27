using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Application.Features.MessageLogs;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.MessageLogs;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace ErpSystem.IntegrationTests;

public sealed class MessageLogPersistenceTests(Xunit.Abstractions.ITestOutputHelper output)
{
    [SqlServerFact]
    public async Task SqlCapturePersistsRedactedSnapshotAndFirstTerminalOutcomeWins()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpMessageLogs");
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseSqlServer(database.ConnectionString,
            sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)).Options;
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            { ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true" }).Build());
        services.AddScoped(_ => new PlatformDbContext(options));
        await using var provider = services.BuildServiceProvider(); await new PlatformModule().MigrateAsync(provider);
        await using var seed = new PlatformDbContext(options);
        seed.Tenants.Add(new PlatformTenant("message-tenant", "message-tenant", "Message test", DateTime.UtcNow));
        var company = new PlatformCompany("message-tenant", "ONE", "One", "واحد", "EGP", "Africa/Cairo", DateTime.UtcNow);
        seed.Companies.Add(company); await seed.SaveChangesAsync();
        var recorder = new MessageAttemptRecorder(options, new CaptureLogger(output));
        var start = new MessageAttemptStart("message-tenant", company.Id, null, "test-correlation", DateTime.UtcNow,
            "email-confirmation", "ar", "test@example.test");
        var id = await recorder.StartAsync(start); Assert.NotNull(id);
        const string secret = "https://app.example.test/action?token=PRIVATE_TOKEN&email=test@example.test";
        await recorder.SnapshotAsync(id.Value, start, MessageSnapshotPolicy.Redact("Hello", "<p>Snapshot</p><a href=\"" + secret + "\">Continue</a>", secret));
        await using var first = new PlatformDbContext(options); await using var second = new PlatformDbContext(options);
        var a = await first.MessageLogEntries.IgnoreQueryFilters().SingleAsync(x => x.Id == id);
        var b = await second.MessageLogEntries.IgnoreQueryFilters().SingleAsync(x => x.Id == id);
        a.Complete(DateTime.UtcNow, 10, "accepted", "disconnect", null, null); await first.SaveChangesAsync();
        b.Complete(DateTime.UtcNow, 20, "failed", "send", "rejected", 550);
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => second.SaveChangesAsync());
        await recorder.CompleteAsync(id.Value, start, new(DateTime.UtcNow, 30, "failed", "send", "rejected", 550));
        await using var verify = new PlatformDbContext(options);
        var stored = await verify.MessageLogEntries.IgnoreQueryFilters().SingleAsync(x => x.Id == id);
        Assert.Equal("accepted", stored.Status); Assert.Equal(10, stored.DurationMs);
        Assert.DoesNotContain("PRIVATE_TOKEN", stored.SnapshotHtml); Assert.DoesNotContain("href", stored.SnapshotHtml);
        Assert.Contains("Snapshot", stored.SnapshotHtml);
        Assert.Null(await recorder.StartAsync(start with { CompanyId = int.MaxValue }));
        Assert.Single(await verify.MessageLogEntries.IgnoreQueryFilters().ToArrayAsync());
        Assert.Empty(await verify.Database.GetPendingMigrationsAsync());
    }
    private sealed class CaptureLogger(Xunit.Abstractions.ITestOutputHelper output) : Microsoft.Extensions.Logging.ILogger<MessageAttemptRecorder>
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(Microsoft.Extensions.Logging.LogLevel logLevel) => true;
        public void Log<TState>(Microsoft.Extensions.Logging.LogLevel logLevel, Microsoft.Extensions.Logging.EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) => output.WriteLine(formatter(state, exception));
    }

}
