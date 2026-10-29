using System.Security.Claims;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Application.Authentication.Tokens;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

/// <summary>Actual session adapter, JWT signer, Identity store and migrated SQL; no production credentials.</summary>
public sealed class PlatformSessionLifecycleTests
{
    [SqlServerFact]
    public async Task Refresh_PreservesSessionAbsoluteExpiry_AndGraceRejectsWithoutRevocation()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        var otherDevice = await fixture.IssueAsync();
        var originalAccess = fixture.Tokens.ValidateExpiredAccessToken(original.Token)!;
        fixture.Clock.Advance(TimeSpan.FromHours(1));
        var replacement = await fixture.RefreshAsync(original);
        Assert.True(replacement.IsSuccess);
        Assert.NotEqual(original.RefreshToken, replacement.Value.RefreshToken);
        Assert.Equal(originalAccess.SessionId, fixture.Tokens.ValidateExpiredAccessToken(replacement.Value.Token)!.SessionId);
        Assert.Equal(original.RefreshTokenExpiration, replacement.Value.RefreshTokenExpiration);
        fixture.Clock.Advance(TimeSpan.FromSeconds(30));
        var grace = await fixture.RefreshAsync(original);
        Assert.Equal(AuthenticationErrorType.Conflict, grace.Error.Type);
        Assert.Equal("User.RefreshTokenAlreadyRotated", grace.Error.Code);
        var user = await fixture.ReadAsync();
        Assert.Equal(2, user.RefreshTokens.Count(token => token.IsActiveAt(fixture.Now)));
        Assert.True(user.RefreshTokens.Single(token => token.SessionId == originalAccess.SessionId && token.RevokedOn is null).IsActiveAt(fixture.Now));
        Assert.Contains(user.RefreshTokens, token => token.SessionId == fixture.SessionId(otherDevice) && token.IsActiveAt(fixture.Now));
    }

    [SqlServerFact]
    public async Task LateReuse_RevokesOnlyMatchingSession_AndLatestPairIsThenRejected()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        var other = await fixture.IssueAsync();
        var replacement = (await fixture.RefreshAsync(original)).Value;
        fixture.Clock.Advance(TimeSpan.FromSeconds(31));
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(original)).Error.Type);
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(replacement)).Error.Type);
        var active = Assert.Single((await fixture.ReadAsync()).RefreshTokens, token => token.IsActiveAt(fixture.Now));
        Assert.Equal(fixture.SessionId(other), active.SessionId);
    }

    [SqlServerFact]
    public async Task Logout_WithRetainedRotatedToken_RevokesSuccessorAndIsIdempotent()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        var other = await fixture.IssueAsync();
        var replacement = (await fixture.RefreshAsync(original)).Value;
        Assert.True((await fixture.LogoutAsync(original.RefreshToken)).IsSuccess);
        Assert.True((await fixture.LogoutAsync(original.RefreshToken)).IsSuccess);
        Assert.True((await fixture.LogoutAsync("unknown-test-token")).IsSuccess);
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(replacement)).Error.Type);
        var active = Assert.Single((await fixture.ReadAsync()).RefreshTokens, token => token.IsActiveAt(fixture.Now));
        Assert.Equal(fixture.SessionId(other), active.SessionId);
        Assert.True((await fixture.LogoutAsync(other.RefreshToken)).IsSuccess);
        Assert.DoesNotContain((await fixture.ReadAsync()).RefreshTokens, token => token.IsActiveAt(fixture.Now));
    }

    [SqlServerFact]
    public async Task InvalidPairExpiryOrCompanyDenial_DoesNotRotateOrRevoke()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        var other = await fixture.IssueAsync();
        Assert.Equal(AuthenticationErrorType.Unauthorized,
            (await fixture.RefreshAsync(original with { RefreshToken = other.RefreshToken })).Error.Type);
        fixture.Companies.Allow = false;
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(original)).Error.Type);
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.SwitchAsync(original)).Error.Type);
        Assert.Equal(2, (await fixture.ReadAsync()).RefreshTokens.Count);
        Assert.All((await fixture.ReadAsync()).RefreshTokens, token => Assert.Null(token.RevokedOn));
        fixture.Companies.Allow = true;
        fixture.Clock.Advance(AuthenticationSessionPolicy.RefreshTokenLifetime);
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(original)).Error.Type);
        Assert.Equal(2, (await fixture.ReadAsync()).RefreshTokens.Count);
    }

    [SqlServerFact]
    public async Task SourceExpiringDuringIssuance_CannotBeRefreshedOrSwitched()
    {
        foreach (var switchCompany in new[] { false, true })
        {
            await using var fixture = await Fixture.CreateAsync();
            var original = await fixture.IssueAsync();
            fixture.Claims.OnRead = () => fixture.Clock.Advance(AuthenticationSessionPolicy.RefreshTokenLifetime);
            var result = switchCompany ? await fixture.SwitchAsync(original) : await fixture.RefreshAsync(original);
            Assert.Equal(AuthenticationErrorType.Unauthorized, result.Error.Type);
            Assert.Null(Assert.Single((await fixture.ReadAsync()).RefreshTokens).RevokedOn);
        }
    }

    [SqlServerFact]
    public async Task DisabledLockedOrStampChangedAccount_CannotRefreshOrSwitch()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        foreach (var state in new[] { "disabled", "locked", "stamp" })
        {
            await fixture.UpdateUserAsync(user =>
            {
                user.IsDisabled = state == "disabled";
                user.LockoutEnd = state == "locked" ? fixture.Clock.GetUtcNow().AddHours(1) : null;
                user.SecurityStamp = state == "stamp" ? "changed-stamp" : Fixture.Stamp;
            });
            Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(original)).Error.Type);
            Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.SwitchAsync(original)).Error.Type);
        }
        Assert.Single((await fixture.ReadAsync()).RefreshTokens);
        Assert.All((await fixture.ReadAsync()).RefreshTokens, token => Assert.Null(token.RevokedOn));
    }

    [SqlServerFact]
    public async Task CompanySwitch_ReplacesOnlyActiveSource_AndCannotResurrectLoggedOutSession()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        var other = await fixture.IssueAsync();
        var switched = await fixture.SwitchAsync(original);
        Assert.True(switched.IsSuccess);
        Assert.Equal(2, switched.Value.CompanyId);
        Assert.NotEqual(fixture.SessionId(original), fixture.SessionId(switched.Value));
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.SwitchAsync(original)).Error.Type);
        Assert.True((await fixture.LogoutAsync(original.RefreshToken)).IsSuccess);
        Assert.True((await fixture.RefreshAsync(switched.Value)).IsSuccess);
        Assert.True((await fixture.LogoutAsync(other.RefreshToken)).IsSuccess);
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.SwitchAsync(other)).Error.Type);
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(other)).Error.Type);
        Assert.Single((await fixture.ReadAsync()).RefreshTokens, token => token.IsActiveAt(fixture.Now));
    }

    [SqlServerFact]
    public async Task ConcurrentRefreshes_CommitOneSuccessor_AndReturnConflictForLoser()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        fixture.Gate.Arm();
        var results = await Task.WhenAll(fixture.RefreshAsync(original), fixture.RefreshAsync(original));
        var winner = Assert.Single(results, result => result.IsSuccess);
        Assert.Equal(AuthenticationErrorType.Conflict, Assert.Single(results, result => result.IsFailure).Error.Type);
        var rows = (await fixture.ReadAsync()).RefreshTokens;
        Assert.Equal(2, rows.Count);
        Assert.Equal(fixture.SessionId(original), Assert.Single(rows, token => token.IsActiveAt(fixture.Now)).SessionId);
        Assert.Equal(original.RefreshTokenExpiration, winner.Value.RefreshTokenExpiration);
    }

    [SqlServerFact]
    public async Task ConcurrentRefreshAndLogout_ReportLoserTruthfully_ThenLogoutConverges()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        fixture.Gate.Arm();
        var refreshTask = fixture.RefreshAsync(original);
        var logoutTask = fixture.LogoutAsync(original.RefreshToken);
        await Task.WhenAll(refreshTask, logoutTask);
        var refresh = await refreshTask;
        var logout = await logoutTask;
        Assert.NotEqual(refresh.IsSuccess, logout.IsSuccess);
        Assert.Equal(AuthenticationErrorType.Conflict, refresh.IsFailure ? refresh.Error.Type : logout.Error.Type);
        Assert.True((await fixture.LogoutAsync(original.RefreshToken)).IsSuccess);
        Assert.DoesNotContain((await fixture.ReadAsync()).RefreshTokens, token => token.IsActiveAt(fixture.Now));
        Assert.Equal(AuthenticationErrorType.Unauthorized, (await fixture.RefreshAsync(original)).Error.Type);
    }

    [SqlServerFact]
    public async Task ConcurrentRefreshAndSwitch_CommitOnlyOneReplacement_PreserveOtherDevice()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        var other = await fixture.IssueAsync();
        fixture.Gate.Arm();
        var results = await Task.WhenAll(fixture.RefreshAsync(original), fixture.SwitchAsync(original));
        var winner = Assert.Single(results, result => result.IsSuccess);
        Assert.Equal(AuthenticationErrorType.Conflict, Assert.Single(results, result => result.IsFailure).Error.Type);
        var active = (await fixture.ReadAsync()).RefreshTokens.Where(token => token.IsActiveAt(fixture.Now)).ToArray();
        Assert.Equal(2, active.Length);
        Assert.Contains(active, token => token.SessionId == fixture.SessionId(other));
        Assert.Contains(active, token => token.SessionId == fixture.SessionId(winner.Value) && token.CompanyId == winner.Value.CompanyId);
    }

    [SqlServerFact]
    public async Task LateReuseRacingWithRefresh_SurfacesPersistenceConflictInsteadOfFalseRevocation()
    {
        await using var fixture = await Fixture.CreateAsync();
        var original = await fixture.IssueAsync();
        var latest = (await fixture.RefreshAsync(original)).Value;
        fixture.Clock.Advance(TimeSpan.FromSeconds(31));
        fixture.Gate.Arm();
        var results = await Task.WhenAll(fixture.RefreshAsync(original), fixture.RefreshAsync(latest));
        Assert.Single(results, result => result.Error.Type == AuthenticationErrorType.Conflict);
        var active = (await fixture.ReadAsync()).RefreshTokens.Count(token => token.IsActiveAt(fixture.Now));
        Assert.Equal(results.Any(result => result.IsSuccess) ? 1 : 0, active);
        Assert.Contains(results, result => result.IsSuccess || result.Error.Type == AuthenticationErrorType.Unauthorized);
    }

    private sealed class Fixture(SqlServerTestDatabase database, ServiceProvider services,
        DbContextOptions<PlatformDbContext> options, MutableClock clock, CompanyAccess companies, SaveGate gate, ClaimSource claims) : IAsyncDisposable
    {
        public const string Stamp = "test-security-stamp";
        public MutableClock Clock => clock;
        public CompanyAccess Companies => companies;
        public SaveGate Gate => gate;
        public ClaimSource Claims => claims;
        public DateTime Now => clock.GetUtcNow().UtcDateTime;
        public IAuthenticationTokenService Tokens => services.GetRequiredService<IAuthenticationTokenService>();
        public string SessionId(AuthenticationSessionResponse response) => Tokens.ValidateExpiredAccessToken(response.Token)!.SessionId;

        public static async Task<Fixture> CreateAsync()
        {
            var database = await SqlServerTestDatabase.CreateAsync("PlatformSessionLifecycle");
            ServiceProvider? provider = null;
            try
            {
                var clock = new MutableClock(); var companies = new CompanyAccess(); var gate = new SaveGate();
                var options = new DbContextOptionsBuilder<PlatformDbContext>().UseSqlServer(database.ConnectionString,
                    sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", PlatformDbContext.Schema)).AddInterceptors(gate).Options;
                var services = new ServiceCollection(); services.AddLogging();
                services.AddSingleton<IConfiguration>(new ConfigurationBuilder().AddInMemoryCollection(
                    new Dictionary<string, string?> { ["DatabaseSettings:ApplyMigrationsOnStartup"] = "true" }).Build());
                services.AddScoped(_ => new PlatformDbContext(options));
                services.AddIdentityCore<PlatformApplicationUser>().AddRoles<PlatformApplicationRole>().AddEntityFrameworkStores<PlatformDbContext>();
                var claims = new ClaimSource();
                services.AddSingleton<IAccessTokenClaimMaterialSource>(claims);
                services.AddPlatformApplication();
                services.AddSingleton<IAuthenticationTokenService>(provider =>
                {
                    var tokenOptions = new AuthenticationTokenOptions { Key = "session-sql-test-only-key-never-for-deployment-1234567890", Issuer = "session-test", Audience = "session-test" };
                    return new JwtAuthenticationTokenService(tokenOptions, provider.GetRequiredService<IAccessTokenClaimMaterialService>(),
                        new JwtAuthenticationTokenValidationParametersFactory(tokenOptions));
                });
                provider = services.BuildServiceProvider();
                await new PlatformModule().MigrateAsync(provider);
                await using var seed = new PlatformDbContext(options);
                seed.Users.Add(new PlatformApplicationUser { Id = "session-test-user", UserName = "session-test-user", NormalizedUserName = "SESSION-TEST-USER",
                    FirstName = "Session", LastName = "Test", SecurityStamp = Stamp, ConcurrencyStamp = Guid.NewGuid().ToString() });
                await seed.SaveChangesAsync();
                return new Fixture(database, provider, options, clock, companies, gate, claims);
            }
            catch
            {
                if (provider is not null) await provider.DisposeAsync();
                await database.DisposeAsync();
                throw;
            }
        }

        public async Task<AuthenticationSessionResponse> IssueAsync()
        {
            await using var scope = services.CreateAsyncScope();
            var user = await scope.ServiceProvider.GetRequiredService<PlatformDbContext>().Users.Include(user => user.RefreshTokens).SingleAsync();
            var result = await Adapter(scope.ServiceProvider).IssueAsync(user, "tenant-test", 1, CancellationToken.None);
            Assert.True(result.IsSuccess);
            return result.Value;
        }

        public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(AuthenticationSessionResponse response)
        {
            await using var scope = services.CreateAsyncScope();
            return await Adapter(scope.ServiceProvider).RefreshAsync(new AuthenticationRefreshRequest(response.Token, response.RefreshToken), CancellationToken.None);
        }

        public async Task<AuthenticationOperationResult> LogoutAsync(string refreshToken)
        {
            await using var scope = services.CreateAsyncScope();
            return await Adapter(scope.ServiceProvider).LogOutAsync(refreshToken, CancellationToken.None);
        }

        public async Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchAsync(AuthenticationSessionResponse response)
        {
            await using var scope = services.CreateAsyncScope();
            var access = Tokens.ValidateExpiredAccessToken(response.Token)!;
            var http = new HttpContextAccessor { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity([
                new Claim(AuthenticationTokenClaimNames.SessionId, access.SessionId), new Claim(AuthenticationTokenClaimNames.SecurityStamp, access.SecurityStamp)], "test")) } };
            return await Adapter(scope.ServiceProvider, http, access.CompanyId).SwitchCompanyAsync(2, CancellationToken.None);
        }

        private PlatformIdentitySessionAdapter Adapter(IServiceProvider provider, IHttpContextAccessor? http = null, int companyId = 1) =>
            new(provider.GetRequiredService<UserManager<PlatformApplicationUser>>(), Tokens, companies, new CurrentContext(companyId),
                http ?? new HttpContextAccessor { HttpContext = new DefaultHttpContext() }, clock);

        public async Task<PlatformApplicationUser> ReadAsync()
        {
            await using var context = new PlatformDbContext(options);
            return await context.Users.AsNoTracking().Include(user => user.RefreshTokens).SingleAsync();
        }

        public async Task UpdateUserAsync(Action<PlatformApplicationUser> update)
        {
            await using var scope = services.CreateAsyncScope();
            var user = await scope.ServiceProvider.GetRequiredService<PlatformDbContext>().Users.SingleAsync();
            update(user);
            Assert.True((await scope.ServiceProvider.GetRequiredService<UserManager<PlatformApplicationUser>>().UpdateAsync(user)).Succeeded);
        }

        public async ValueTask DisposeAsync()
        {
            try { await services.DisposeAsync(); }
            finally { await database.DisposeAsync(); }
        }
    }

    private sealed class MutableClock : TimeProvider
    {
        private DateTimeOffset _now = DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow() => _now;
        public void Advance(TimeSpan duration) => _now = _now.Add(duration);
    }

    private sealed class CurrentContext(int companyId) : ICurrentExecutionContext
    {
        public string? UserId => "session-test-user";
        public string? TenantId => "tenant-test";
        public int? CompanyId => companyId;
    }

    private sealed class CompanyAccess : ICompanyAccessService
    {
        public bool Allow { get; set; } = true;
        public Task<CompanyAccessOption?> GetAvailableCompanyAsync(string userId, string tenantId, int companyId, CancellationToken cancellationToken = default) =>
            Task.FromResult(Allow ? new CompanyAccessOption(companyId, "TEST", "شركة اختبار", "Test company") : null);
        public Task<IReadOnlyList<CompanyAccessOption>> GetAvailableCompaniesAsync(string userId, string tenantId, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<CompanyAccessOption>>([]);
    }

    private sealed class ClaimSource : IAccessTokenClaimMaterialSource
    {
        public Action? OnRead { get; set; }
        public Task<AccessTokenClaimMaterialSourceSnapshot> GetAsync(string userId, string tenantId, CancellationToken cancellationToken = default)
        {
            OnRead?.Invoke();
            return Task.FromResult(new AccessTokenClaimMaterialSourceSnapshot(new AccessTokenTenantSnapshot(tenantId, "Test tenant", "Test plan"), [], []));
        }
    }

    private sealed class SaveGate : SaveChangesInterceptor
    {
        private TaskCompletionSource? _ready;
        private int _arrivals;
        public void Arm() { _arrivals = 0; _ready = new(TaskCreationOptions.RunContinuationsAsynchronously); }
        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData,
            InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            var ready = _ready;
            if (ready is not null && !ready.Task.IsCompleted && eventData.Context!.ChangeTracker.Entries<PlatformApplicationUser>().Any(entry => entry.State == EntityState.Modified))
            {
                if (Interlocked.Increment(ref _arrivals) == 2) ready.TrySetResult();
                await ready.Task.WaitAsync(TimeSpan.FromSeconds(20), cancellationToken);
            }
            return result;
        }
    }
}
