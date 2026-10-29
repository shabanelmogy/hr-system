using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using ErpSystem.Api.Hosting;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.Authentication.SelectionChallenges;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.SessionValidation;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Application.TenantMembership;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Contracts.Authentication.Browser;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Presentation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ErpSystem.IntegrationTests;

public sealed class BrowserAuthenticationTransportTests
{
    private static readonly JsonSerializerOptions ReportOptions = new() { WriteIndented = true };
    private const string SigningKey = "browser-transport-test-only-key-never-a-deployment-secret-123456789";
    private const string UserId = "browser-transport-user";
    private const string TenantId = "browser-tenant";

    [BrowserAuthenticationPreflightFact]
    public async Task RealBrowser_UsesProductionRoutesJwtIdentityAndSql_WithoutCredentialJson()
    {
        var root = FindRoot();
        await using var database = await SqlServerTestDatabase.CreateAsync("BrowserAuthTransport");
        using var pem = X509Certificate2.CreateFromPemFile(Path.Combine(root, "web-next/certificates/localhost.pem"),
            Path.Combine(root, "web-next/certificates/localhost-key.pem"));
        using var certificate = X509CertificateLoader.LoadPkcs12(pem.Export(X509ContentType.Pkcs12), string.Empty);
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Development" });
        // This fixture composes authentication only, not unrelated module handlers.
        // Keep scope validation; real host composition remains covered by full API gates.
        builder.Host.UseDefaultServiceProvider(options => { options.ValidateOnBuild = false; options.ValidateScopes = true; });
        builder.Logging.ClearProviders();
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Listen(IPAddress.Loopback, 0, listen => { listen.Protocols = HttpProtocols.Http1; listen.UseHttps(certificate); });
            options.Listen(IPAddress.Loopback, 0, listen => { listen.Protocols = HttpProtocols.Http1; listen.UseHttps(certificate); });
        });
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true",
            ["CorsSettings:AllowedOrigins:0"] = "https://localhost:4210",
            ["BrowserAuthentication:AllowedOrigins:0"] = "https://localhost:4210"
        });
        var state = new TransportState();
        builder.Services.AddSingleton(state);
        builder.Services.AddSingleton<IConfiguration>(builder.Configuration);
        builder.Services.AddDataProtection().UseEphemeralDataProtectionProvider();
        builder.Services.AddLocalization();
        builder.Services.AddHostCors(builder.Configuration);
        builder.Services.AddPlatformApplication();
        builder.Services.AddPlatformPresentation();
        builder.Services.AddPlatformIdentity(builder.Configuration);
        builder.Services.AddApiVersioning().AddMvc();
        builder.Services.AddRateLimiter(options => options.AddPolicy("authentication", _ =>
            System.Threading.RateLimiting.RateLimitPartition.GetNoLimiter("isolated-browser-test")));
        builder.Services.AddAuthorizationBuilder()
            .AddPolicy("write", policy => policy.RequireAuthenticatedUser().RequireClaim(PermissionClaimNames.Permission, "Transport:Write"))
            .AddPolicy("denied", policy => policy.RequireAuthenticatedUser().RequireClaim(PermissionClaimNames.Permission, "Transport:Denied"));
        var tokenOptions = new AuthenticationTokenOptions { Key = SigningKey, Issuer = "browser-test", Audience = "browser-test" };
        builder.Services.AddSingleton(tokenOptions);
        builder.Services.AddSingleton<IAuthenticationTokenValidationParametersFactory, JwtAuthenticationTokenValidationParametersFactory>();
        builder.Services.AddScoped<IAuthenticationTokenService, JwtAuthenticationTokenService>();
        builder.Services.AddScoped<ICurrentExecutionContext, HttpCurrentExecutionContext>();
        builder.Services.AddDbContext<PlatformDbContext>(options => options.UseSqlServer(database.ConnectionString,
            sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)));
        builder.Services.AddScoped<PlatformContractSource>();
        builder.Services.AddScoped<ITenantAccessSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        builder.Services.AddScoped<ITenantMembershipSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        builder.Services.AddScoped<ICompanyAccessSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        builder.Services.AddScoped<ISessionValidationSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        builder.Services.AddScoped<ITenantModuleEntitlementSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        builder.Services.AddScoped<ISelectionChallengeSource>(provider => provider.GetRequiredService<PlatformContractSource>());
        builder.Services.AddScoped<IAccessTokenClaimMaterialSource, CapacityClaimSource>();
        builder.Services.AddScoped<IAuthenticationSessionAdapter, LogoutFailureAdapter>();
        await using var app = builder.Build();
        await new PlatformModule().MigrateAsync(app.Services);
        var companies = await SeedAsync(app.Services);
        app.UseRouting();
        app.UseCors(HostInfrastructureServiceCollectionExtensions.BrowserCorsPolicy);
        app.UseAuthentication(); app.UseRateLimiter(); app.UseAuthorization();
        new PlatformModule().ConfigureApplication(app);
        app.MapControllers();
        app.MapGet("/", () => Results.Content("<!doctype html><title>Isolated browser transport verification</title>", "text/html"));
        app.MapGet("/test/read", () => Results.NoContent()).RequireAuthorization();
        app.MapGet("/test/global-csrf", (HttpContext context, Microsoft.AspNetCore.Antiforgery.IAntiforgery antiforgery) =>
            Results.Json(new { requestToken = antiforgery.GetAndStoreTokens(context).RequestToken })).RequireAuthorization();
        app.MapPost("/test/write", () => { state.Writes++; return Results.NoContent(); }).RequireAuthorization("write");
        app.MapPost("/test/denied", () => Results.NoContent()).RequireAuthorization("denied");
        app.MapPost("/test/oversize", (bool enabled) => { state.Oversized = enabled; return Results.NoContent(); }).RequireAuthorization();
        app.MapPost("/test/fail-logout", () => { state.FailLogout = true; return Results.NoContent(); })
            .RequireAuthorization().WithMetadata(new ErpSystem.Modules.Platform.Contracts.Tenancy.AllowTenantReadOnlyAttribute());
        app.MapPost("/test/readonly", async (PlatformDbContext db) =>
        {
            await db.Tenants.Where(tenant => tenant.Id == TenantId).ExecuteUpdateAsync(update =>
                update.SetProperty(tenant => tenant.SubscriptionEndsOn, DateTime.UtcNow.AddMinutes(-1)));
            return Results.NoContent();
        }).RequireAuthorization();
        app.MapPost("/test/expire", async (HttpContext context, IBrowserAuthenticationCookies cookies) =>
        {
            var token = new JwtSecurityTokenHandler().ReadJwtToken(cookies.Read().Token!);
            token.Payload[JwtRegisteredClaimNames.Exp] = DateTimeOffset.UtcNow.AddMinutes(-5).ToUnixTimeSeconds();
            var expired = new JwtSecurityToken(token.Header, token.Payload);
            var jwt = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(tokenOptions.Issuer, tokenOptions.Audience,
                expired.Claims.Where(claim => claim.Type is not ("exp" or "nbf" or "iat")),
                expires: DateTime.UtcNow.AddMinutes(-5), signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)), SecurityAlgorithms.HmacSha256)));
            context.Response.Cookies.Append(BrowserAuthenticationDefaults.AccessCookie, jwt,
                new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Lax, Path = "/" });
            await context.Response.CompleteAsync();
        }).RequireAuthorization();
        await app.StartAsync();
        var origins = app.Urls.Order(StringComparer.Ordinal).Select(url => url.Replace("127.0.0.1", "localhost", StringComparison.Ordinal)).ToArray();
        var allowed = app.Services.GetRequiredService<IOptions<BrowserAuthenticationOptions>>().Value.AllowedOrigins;
        allowed.Clear(); allowed.Add(origins[0]);
        var cors = app.Services.GetRequiredService<IOptions<CorsOptions>>().Value.GetPolicy(HostInfrastructureServiceCollectionExtensions.BrowserCorsPolicy)!;
        cors.Origins.Clear(); cors.Origins.Add(origins[0]);
        var start = new ProcessStartInfo("node") { RedirectStandardOutput = true, RedirectStandardError = true, UseShellExecute = false, CreateNoWindow = true };
        start.ArgumentList.Add("--use-system-ca");
        start.ArgumentList.Add(Path.Combine(root, "documentation/modules/platform/features/platform-browser-authentication/verification/browser-transport.mjs"));
        foreach (var argument in new[] { root, origins[0], origins[1], companies[0].ToString(System.Globalization.CultureInfo.InvariantCulture), companies[1].ToString(System.Globalization.CultureInfo.InvariantCulture) })
            start.ArgumentList.Add(argument);
        using var process = Process.Start(start)!;
        var stdout = process.StandardOutput.ReadToEndAsync(); var stderr = process.StandardError.ReadToEndAsync();
        try { await process.WaitForExitAsync().WaitAsync(TimeSpan.FromSeconds(55)); }
        finally { if (!process.HasExited) { process.Kill(entireProcessTree: true); await process.WaitForExitAsync(); } }
        Assert.True(process.ExitCode == 0, await stderr);
        Assert.Equal(2, state.Writes);
        await using (var scope = app.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
            Assert.Single(await db.Users.AsNoTracking().SelectMany(user => user.RefreshTokens).Where(token => token.RevokedOn == null && token.ExpiresOn > DateTime.UtcNow).ToArrayAsync());
            Assert.False(db.Database.HasPendingModelChanges());
        }
        using var result = JsonDocument.Parse(await stdout);
        var report = new { evidence = "Actual password/tenant/company controllers, JWT/live scope/Identity/SQL and trusted Chromium; test control endpoints exist only in this fixture", browser = result.RootElement.Clone(), state.Writes,
            schema = "Existing Platform migrations; no pending model change; disposable SQL database", logoutFailure = "503 and Cookie deletion verified; one intentionally unrevoked fixture session remains until database disposal" };
        await File.WriteAllTextAsync(Path.Combine(root, "documentation/modules/platform/features/platform-browser-authentication/verification/results/browser-transport.json"),
            JsonSerializer.Serialize(report, ReportOptions) + Environment.NewLine);
        await app.StopAsync();
    }

    private static async Task<int[]> SeedAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<PlatformApplicationUser>>();
        var user = new PlatformApplicationUser { Id = UserId, UserName = "browser-user", Email = "browser@test.invalid", EmailConfirmed = true, FirstName = "Browser", LastName = "Fixture" };
        Assert.True((await users.CreateAsync(user, "BrowserFixture123!")).Succeeded);
        var tenants = new[] { new PlatformTenant(TenantId, TenantId, "Browser tenant", DateTime.UtcNow),
            new PlatformTenant("other-browser-tenant", "other-browser-tenant", "Other tenant", DateTime.UtcNow) };
        db.Tenants.AddRange(tenants);
        foreach (var tenant in tenants) db.UserTenantAccesses.Add(new PlatformUserTenantAccess { UserId = UserId, TenantId = tenant.Id });
        var companies = new[] { new PlatformCompany(TenantId, "B1", "First", "الأولى", "USD", "UTC", DateTime.UtcNow),
            new PlatformCompany(TenantId, "B2", "Second", "الثانية", "USD", "UTC", DateTime.UtcNow) };
        db.Companies.AddRange(companies); await db.SaveChangesAsync();
        foreach (var company in companies) db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess { UserId = UserId, TenantId = TenantId, CompanyId = company.Id });
        var role = new PlatformApplicationRole("browser-fixture-role") { Id = "browser-role", TenantId = TenantId, NormalizedName = "BROWSER-FIXTURE-ROLE" };
        db.Roles.Add(role); await db.SaveChangesAsync();
        db.UserRoles.Add(new IdentityUserRole<string> { UserId = UserId, RoleId = role.Id });
        db.RoleClaims.Add(new IdentityRoleClaim<string> { RoleId = role.Id, ClaimType = PermissionClaimNames.Permission, ClaimValue = "Transport:Write" });
        await db.SaveChangesAsync();
        return companies.Select(company => company.Id).ToArray();
    }

    private static string FindRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null && !File.Exists(Path.Combine(current.FullName, "api/ErpSystem.sln"))) current = current.Parent;
        return current?.FullName ?? throw new InvalidOperationException("Repository root not found.");
    }

    private sealed class TransportState { public bool Oversized; public bool FailLogout; public int Writes; }
    private sealed class CapacityClaimSource(PlatformContractSource source, TransportState state) : IAccessTokenClaimMaterialSource
    {
        public async Task<AccessTokenClaimMaterialSourceSnapshot> GetAsync(string userId, string tenantId, CancellationToken cancellationToken = default)
        {
            var actual = await ((IAccessTokenClaimMaterialSource)source).GetAsync(userId, tenantId, cancellationToken);
            return state.Oversized ? actual with { Tenant = actual.Tenant! with { Name = new string('x', 25_000) } } : actual;
        }
    }
    private sealed class LogoutFailureAdapter(PlatformIdentitySessionAdapter actual, TransportState state) : IAuthenticationSessionAdapter
    {
        public Task<AuthenticationOperationResult> LogOutAsync(string refreshToken, CancellationToken cancellationToken) =>
            state.FailLogout ? throw new InvalidOperationException("Isolated revocation failure fixture.") : actual.LogOutAsync(refreshToken, cancellationToken);
        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(AuthenticationRefreshRequest request, CancellationToken cancellationToken) => actual.RefreshAsync(request, cancellationToken);
        public Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchCompanyAsync(int companyId, CancellationToken cancellationToken) => actual.SwitchCompanyAsync(companyId, cancellationToken);
        public Task<AuthenticationOperationResult> RevokeUserSessionsAsync(string userId, CancellationToken cancellationToken = default) => actual.RevokeUserSessionsAsync(userId, cancellationToken);
    }
}
