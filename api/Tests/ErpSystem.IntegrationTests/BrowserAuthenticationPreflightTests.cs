using System.Diagnostics;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using ErpSystem.Api.Hosting;
using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Xunit.Abstractions;

namespace ErpSystem.IntegrationTests;

/// <summary>Preflight probes only: current token/model and isolated framework transport, not new ERP endpoints.</summary>
public sealed class BrowserAuthenticationPreflightTests(ITestOutputHelper output)
{
    private const string ReportRoot = "documentation/modules/platform/features/platform-browser-authentication/verification/results";
    private static readonly JsonSerializerOptions ReportOptions = new() { WriteIndented = true };

    [Fact]
    public async Task CurrentTokenGenerator_ReportsCatalogSizedCookieCapacityAndRoundTripsChunks()
    {
        var catalog = Directory.EnumerateFiles(AppContext.BaseDirectory, "ErpSystem.Modules.*.Contracts.dll")
            .Append(Path.Combine(AppContext.BaseDirectory, "ErpSystem.Modules.Contacts.Application.dll"))
            .Select(Assembly.LoadFrom)
            .SelectMany(assembly => assembly.GetExportedTypes())
            .Where(type => type.Name.EndsWith("Permissions", StringComparison.Ordinal))
            .SelectMany(type => type.GetFields(BindingFlags.Public | BindingFlags.Static))
            .Where(field => field.IsLiteral && field.FieldType == typeof(string))
            .Select(field => (string)field.GetRawConstantValue()!)
            .Where(value => value.Contains(':', StringComparison.Ordinal))
            .Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();
        Assert.NotEmpty(catalog);
        var measurements = new List<object>();
        foreach (var roles in new[] { 1, 10, 25 })
        {
            var source = new PreflightClaimSource(catalog, roles);
            var services = new ServiceCollection();
            services.AddSingleton<IAccessTokenClaimMaterialSource>(source);
            services.AddPlatformApplication();
            await using var provider = services.BuildServiceProvider();
            using var scope = provider.CreateScope();
            var options = new AuthenticationTokenOptions
            {
                Key = "preflight-test-only-key-never-a-deployment-secret-0123456789",
                Issuer = "preflight.invalid", Audience = "preflight-client"
            };
            var signer = new JwtAuthenticationTokenService(options,
                scope.ServiceProvider.GetRequiredService<IAccessTokenClaimMaterialService>(),
                new JwtAuthenticationTokenValidationParametersFactory(options));
            var issued = await signer.GenerateAccessTokenAsync(
                new AccessTokenUserSnapshot(new string('u', 32), new string('n', 256), new string('e', 240) + "@test.invalid",
                    new string('f', 100), new string('l', 100), new string('s', 36)), new string('a', 32), 1, new string('t', 32));
            Assert.NotNull(signer.ValidateExpiredAccessToken(issued.Token));
            var manager = new ChunkingCookieManager { ChunkSize = 3000, ThrowForPartialCookies = true };
            var context = new DefaultHttpContext();
            manager.AppendResponseCookie(context, "__Host-erp-angular-access", issued.Token,
                new CookieOptions { Secure = true, HttpOnly = true, Path = "/", SameSite = SameSiteMode.Lax });
            var cookies = context.Response.Headers.SetCookie.Select(value => value!.Split(';', 2)[0]).ToArray();
            var header = string.Join("; ", cookies) + "; __Host-erp-angular-refresh=" + new string('r', 86)
                + "; __Host-erp-angular-antiforgery=" + new string('x', 256);
            var incoming = new DefaultHttpContext(); incoming.Request.Headers.Cookie = header;
            Assert.Equal(issued.Token, manager.GetRequestCookie(incoming, "__Host-erp-angular-access"));
            if (cookies.Length > 1)
            {
                var partial = new DefaultHttpContext();
                partial.Request.Headers.Cookie = string.Join("; ", cookies.SkipLast(1));
                Assert.Throws<FormatException>(() => manager.GetRequestCookie(partial, "__Host-erp-angular-access"));
            }
            measurements.Add(new { roles, permissionCount = catalog.Length, jwtBytes = Encoding.UTF8.GetByteCount(issued.Token),
                accessCookieParts = cookies.Length, cookieHeaderBytes = Encoding.UTF8.GetByteCount(header),
                fits16KiBTotalBeforeOtherHeaders = Encoding.UTF8.GetByteCount(header) < 16 * 1024,
                fits32KiBTotalBeforeOtherHeaders = Encoding.UTF8.GetByteCount(header) < 32 * 1024 });
        }
        Report("token-capacity.json", new { evidence = "actual Platform claim builder and signer; synthetic long display fields, complete compiled permission catalogs; not a production maximum-role guarantee", measurements });
    }

    [SqlServerFact]
    public async Task CurrentSqlIdentityConcurrency_RollsBackTheLosingOwnedRefreshWrite()
    {
        await using var database = await SqlServerTestDatabase.CreateAsync("ErpBrowserAuthPreflight");
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseSqlServer(database.ConnectionString,
            sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)).Options;
        var services = new ServiceCollection(); services.AddLogging();
        services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?> { ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true" }).Build());
        services.AddScoped(_ => new PlatformDbContext(options));
        services.AddIdentityCore<PlatformApplicationUser>().AddRoles<PlatformApplicationRole>().AddEntityFrameworkStores<PlatformDbContext>();
        await using var provider = services.BuildServiceProvider();
        await new PlatformModule().MigrateAsync(provider);
        var now = DateTime.UtcNow;
        await using (var seed = new PlatformDbContext(options))
        {
            seed.Users.Add(new PlatformApplicationUser { Id = "preflight-user", UserName = "preflight-user",
                NormalizedUserName = "PREFLIGHT-USER", FirstName = "Preflight", LastName = "Only",
                SecurityStamp = "test-stamp", ConcurrencyStamp = "initial-concurrency",
                RefreshTokens = [Token("original", now)] });
            await seed.SaveChangesAsync();
        }
        await using var scopeA = provider.CreateAsyncScope(); await using var scopeB = provider.CreateAsyncScope();
        var a = scopeA.ServiceProvider.GetRequiredService<PlatformDbContext>();
        var b = scopeB.ServiceProvider.GetRequiredService<PlatformDbContext>();
        Assert.True(a.Model.FindEntityType(typeof(PlatformApplicationUser))!
            .FindProperty(nameof(PlatformApplicationUser.ConcurrencyStamp))!.IsConcurrencyToken);
        var userA = await a.Users.Include(user => user.RefreshTokens).SingleAsync();
        var userB = await b.Users.Include(user => user.RefreshTokens).SingleAsync();
        foreach (var (user, id) in new[] { (userA, "replacement-a"), (userB, "replacement-b") })
        { user.RefreshTokens[0].Revoke(PlatformRefreshToken.RotationReason, now); user.RefreshTokens.Add(Token(id, now)); }
        var results = await Task.WhenAll(
            scopeA.ServiceProvider.GetRequiredService<UserManager<PlatformApplicationUser>>().UpdateAsync(userA),
            scopeB.ServiceProvider.GetRequiredService<UserManager<PlatformApplicationUser>>().UpdateAsync(userB));
        Assert.Single(results, result => result.Succeeded);
        var rejected = Assert.Single(results, result => !result.Succeeded);
        Assert.Contains(rejected.Errors, error => error.Code == "ConcurrencyFailure");
        await using var verify = new PlatformDbContext(options);
        var persisted = await verify.Users.Include(user => user.RefreshTokens).SingleAsync();
        Assert.Equal(2, persisted.RefreshTokens.Count);
        Assert.Single(persisted.RefreshTokens, token => token.IsActiveAt(now));
        Assert.NotNull(persisted.RefreshTokens.Single(token => token.TokenHash == "original").RevokedOn);
        Report("sql-concurrency.json", new { provider = "SQL Server LocalDB or explicit isolated test connection",
            migrations = "existing Platform migrations applied to disposable database; helper removes it",
            successfulWriters = 1, concurrencyFailures = 1, persistedRefreshRows = 2, activeRefreshRows = 1,
            evidence = "actual Platform EF model and Identity UserManager transaction; not the unmodified RefreshAsync business behavior" });
    }

    [BrowserAuthenticationPreflightFact]
    public async Task HttpsBrowserProbe_VerifiesCredentialedCorsAndServerAntiforgery()
    {
        var root = RepositoryRoot();
        using var pemCertificate = X509Certificate2.CreateFromPemFile(Path.Combine(root, "web-next/certificates/localhost.pem"),
            Path.Combine(root, "web-next/certificates/localhost-key.pem"));
        // Match Kestrel's Windows PEM loader: Schannel needs a persisted key handle.
        // The PFX bytes stay in memory; no key/password is logged or written.
        using var certificate = X509CertificateLoader.LoadPkcs12(pemCertificate.Export(X509ContentType.Pkcs12), string.Empty,
            X509KeyStorageFlags.DefaultKeySet);
        Assert.True(certificate.NotAfter.ToUniversalTime() > DateTime.UtcNow);
        var builder = WebApplication.CreateBuilder(); builder.Logging.ClearProviders();
        builder.WebHost.ConfigureKestrel(server =>
        {
            server.Listen(System.Net.IPAddress.Loopback, 0, listen => listen.UseHttps(certificate));
            server.Listen(System.Net.IPAddress.Loopback, 0, listen => listen.UseHttps(certificate));
        });
        builder.Services.AddDataProtection().UseEphemeralDataProtectionProvider();
        builder.Services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-ERP-XSRF"; options.Cookie.Name = "__Host-erp-preflight-antiforgery";
            options.Cookie.HttpOnly = true; options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Lax; options.Cookie.Path = "/";
        });
        builder.Services.AddHostCors(new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?> { ["CorsSettings:AllowedOrigins:0"] = "https://localhost:4200" }).Build());
        await using var app = builder.Build(); app.UseCors(HostInfrastructureServiceCollectionExtensions.BrowserCorsPolicy);
        var allowedOrigin = string.Empty; var writes = 0;
        app.MapGet("/", () => Results.Content("<!doctype html><title>Isolated preflight harness</title>", "text/html"));
        app.MapGet("/csrf", (HttpContext context, IAntiforgery antiforgery) =>
        {
            context.Response.Headers.CacheControl = "no-store";
            return Results.Json(new { requestToken = antiforgery.GetAndStoreTokens(context).RequestToken });
        });
        app.MapPost("/write", async (HttpContext context, IAntiforgery antiforgery) =>
        {
            if (context.Request.Headers.Origin != allowedOrigin) return Results.StatusCode(403);
            try { await antiforgery.ValidateRequestAsync(context); }
            catch (AntiforgeryValidationException) { return Results.StatusCode(400); }
            Interlocked.Increment(ref writes); return Results.NoContent();
        });
        app.MapGet("/capacity", (HttpContext context) =>
        {
            var chunker = new ChunkingCookieManager { ChunkSize = 3000 };
            var cookieOptions = new CookieOptions { Secure = true, HttpOnly = true, Path = "/", SameSite = SameSiteMode.Lax };
            // Synthetic values only: emulate simultaneous Next and Angular cookies on localhost.
            chunker.AppendResponseCookie(context, "__Host-erp-preflight-access", new string('a', 14 * 1024), cookieOptions);
            chunker.AppendResponseCookie(context, "__Host-next-preflight-access", new string('b', 14 * 1024), cookieOptions);
            return Results.NoContent();
        });
        app.MapGet("/over-capacity", (HttpContext context) =>
        {
            new ChunkingCookieManager { ChunkSize = 3000 }.AppendResponseCookie(context,
                "__Host-overflow-preflight", new string('c', 16 * 1024),
                new CookieOptions { Secure = true, HttpOnly = true, Path = "/" });
            return Results.NoContent();
        });
        app.MapGet("/cookie-count", (HttpContext context) => Results.Json(new
        {
            cookieHeaderBytes = Encoding.UTF8.GetByteCount(context.Request.Headers.Cookie.ToString())
        }));
        await app.StartAsync();
        var addresses = app.Urls.Select(address => address.Replace("127.0.0.1", "localhost", StringComparison.Ordinal)).ToArray();
        Assert.Equal(2, addresses.Length); allowedOrigin = addresses[0];
        var cors = app.Services.GetRequiredService<IOptions<CorsOptions>>().Value
            .GetPolicy(HostInfrastructureServiceCollectionExtensions.BrowserCorsPolicy)!;
        cors.Origins.Clear(); cors.Origins.Add(allowedOrigin);
        var start = new ProcessStartInfo("node") { RedirectStandardOutput = true, RedirectStandardError = true, UseShellExecute = false, CreateNoWindow = true };
        start.ArgumentList.Add(Path.Combine(root, "documentation/modules/platform/features/platform-browser-authentication/verification/browser-probe.mjs"));
        start.ArgumentList.Add(root); start.ArgumentList.Add(addresses[0]); start.ArgumentList.Add(addresses[1]);
        using var process = Process.Start(start)!;
        var standardOutput = process.StandardOutput.ReadToEndAsync(); var standardError = process.StandardError.ReadToEndAsync();
        try { await process.WaitForExitAsync().WaitAsync(TimeSpan.FromSeconds(45)); }
        finally
        {
            if (!process.HasExited) { process.Kill(entireProcessTree: true); await process.WaitForExitAsync(); }
        }
        Assert.True(process.ExitCode == 0, await standardError);
        Assert.Equal(1, writes);
        using var browserResult = JsonDocument.Parse(await standardOutput);
        Report("https-antiforgery.json", new { certificateValidUntilUtc = certificate.NotAfter.ToUniversalTime(),
            evidence = "real Chromium, existing development certificate, isolated two-origin HTTPS framework harness; not deployed ERP browser endpoints",
            browser = browserResult.RootElement.Clone(), successfulWrites = writes });
        await app.StopAsync();
    }

    private static PlatformRefreshToken Token(string hash, DateTime now) =>
        PlatformRefreshToken.Create(hash, new string('a', 32), Guid.NewGuid().ToString("N"), 1, now, now.AddDays(14), null, null);

    private void Report(string filename, object value)
    {
        var json = JsonSerializer.Serialize(value, ReportOptions);
        var folder = Path.Combine(RepositoryRoot(), ReportRoot); Directory.CreateDirectory(folder);
        File.WriteAllText(Path.Combine(folder, filename), json + Environment.NewLine);
        output.WriteLine(json); // Measurements only; never tokens, Cookie values, keys or connection strings.
    }

    private static string RepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "api/ErpSystem.sln"))) directory = directory.Parent;
        return directory?.FullName ?? throw new InvalidOperationException("Repository root not found.");
    }

    private sealed class PreflightClaimSource(string[] permissions, int roleCount) : IAccessTokenClaimMaterialSource
    {
        public Task<AccessTokenClaimMaterialSourceSnapshot> GetAsync(string userId, string tenantId, CancellationToken cancellationToken = default)
        {
            var roles = Enumerable.Range(0, roleCount).Select(index => new AccessTokenRoleSnapshot(
                $"role-{index:D2}-" + new string('i', 24), $"role-{index:D2}-" + new string('n', 64), tenantId, false, false)).ToArray();
            return Task.FromResult(new AccessTokenClaimMaterialSourceSnapshot(new AccessTokenTenantSnapshot(tenantId, new string('t', 200), new string('p', 100)),
                roles, roles.SelectMany(role => permissions.Select(permission => new AccessTokenRoleClaimSnapshot(role.Id, PermissionClaimNames.Permission, permission))).ToArray()));
        }
    }
}

/// <summary>The trusted-browser probe requires explicit local prerequisites, outside ordinary API gates.</summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
public sealed class BrowserAuthenticationPreflightFactAttribute : FactAttribute
{
    public BrowserAuthenticationPreflightFactAttribute()
    {
        if (Environment.GetEnvironmentVariable("ERPSYSTEM_TEST_BROWSER_AUTH_PREFLIGHT") != "1")
            Skip = "Set ERPSYSTEM_TEST_BROWSER_AUTH_PREFLIGHT=1 with trusted localhost certificates and installed web-next Playwright/Chromium to run this preflight probe.";
    }
}
