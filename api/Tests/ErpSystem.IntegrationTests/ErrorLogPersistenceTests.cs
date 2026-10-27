using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

public sealed class ErrorLogPersistenceTests
{
    [SqlServerFact]
    public async Task Sql_retention_cleanup_preserves_boundary_and_is_bounded_and_settings_races_are_audited_atomically()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpErrorLogRetention");
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseSqlServer(database.ConnectionString, sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)).Options;
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true"
        }).Build();
        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddScoped(_ => new PlatformDbContext(options));
        await using var provider = services.BuildServiceProvider();
        await new PlatformModule().MigrateAsync(provider);

        await using var db = new PlatformDbContext(options);
        var clock = new FixedClock();
        var store = new ErrorLogStore(db, new ErrorLogCaptureQueue(), clock);
        Assert.Equal(90, (await store.GetSettingsAsync(default)).RetentionDays);
        Assert.NotNull(await store.UpdateSettingsAsync(2, 0, "operator", default));

        ErrorLogEntry Entry(DateTime date) => ErrorLogEntry.Create(Guid.NewGuid(), date, "api", "error", null, null,
            null, "HTTP", "GET", 500, 1, null, "HttpServerError", "http", "Other", null, null);
        var cutoff = clock.GetUtcNow().UtcDateTime.AddDays(-2);
        var boundary = Entry(cutoff); var fresh = Entry(cutoff.AddSeconds(1)); var future = Entry(cutoff.AddDays(3));
        db.ErrorLogEntries.AddRange(Enumerable.Range(0, 5001).Select(_ => Entry(cutoff.AddSeconds(-1))));
        db.ErrorLogEntries.AddRange(boundary, fresh, future);
        await db.SaveChangesAsync();
        Assert.Equal(5000, await ErrorLogCleanup.DeleteExpiredAsync(db, clock, default));
        Assert.Equal(4, await db.ErrorLogEntries.CountAsync());
        Assert.Equal(1, await ErrorLogCleanup.DeleteExpiredAsync(db, clock, default));
        Assert.Equal(3, await db.ErrorLogEntries.CountAsync());
        Assert.True(await db.ErrorLogEntries.AnyAsync(x => x.Id == boundary.Id));
        Assert.Equal(0, await ErrorLogCleanup.DeleteExpiredAsync(db, clock, default));

        await using var otherDb = new PlatformDbContext(options);
        var other = new ErrorLogStore(otherDb, new ErrorLogCaptureQueue(), clock);
        // Independent request scopes compete using the same revision. SQL locking
        // and the concurrency token allow one committed settings/audit pair.
        var results = await Task.WhenAll(store.UpdateSettingsAsync(3, 1, "operator", default),
            other.UpdateSettingsAsync(4, 1, "operator", default));
        Assert.Single(results, value => value is not null);
        Assert.Single(results, value => value is null);
        Assert.Equal(2, await db.SecurityAuditEvents.IgnoreQueryFilters().CountAsync());
        Assert.Equal(2, (await store.GetSettingsAsync(default)).Revision);
    }

    private sealed class FixedClock : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => new(2026, 10, 17, 12, 0, 0, TimeSpan.Zero);
    }
}
