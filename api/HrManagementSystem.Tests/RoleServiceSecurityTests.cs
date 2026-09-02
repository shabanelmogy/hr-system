using System.Security.Claims;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Security.Authorization.Contracts;
using HrManagementSystem.Application.Features.Security.Authorization.Errors;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authorization.Services;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;

namespace HrManagementSystem.Tests;

public sealed class RoleServiceSecurityTests
{
    [Fact]
    public async Task UpdateRoleClaims_RevokesActiveTokens_AndUpdatesSecurityStamp_ForAssignedUsers()
    {
        var tenantId = "tenant-sec-1";
        await using var fixture = await SecurityTestFixture.CreateAsync(tenantId);

        var role = new ApplicationRole("Operations")
        {
            TenantId = tenantId,
            IsSystem = false
        };
        await fixture.RoleManager.CreateAsync(role);
        await fixture.RoleManager.AddClaimAsync(role, new Claim(Permissions.Type, Permissions.ViewUsers));

        var assignedUser = fixture.CreateUser("user-assigned", tenantId);
        var unassignedUser = fixture.CreateUser("user-other", tenantId);
        await fixture.UserManager.CreateAsync(assignedUser);
        await fixture.UserManager.CreateAsync(unassignedUser);

        fixture.AssignRole(assignedUser.Id, role.Id);
        await fixture.Context.SaveChangesAsync();

        var initialStampAssigned = assignedUser.SecurityStamp;
        var initialStampUnassigned = unassignedUser.SecurityStamp;

        var request = new RoleRequest(
            role.Id,
            role.Name!,
            [
                new CheckBoxViewModel { DisplayValue = Permissions.ViewUsers, IsSelected = false },
                new CheckBoxViewModel { DisplayValue = Permissions.CreateUsers, IsSelected = true }
            ]);

        var result = await fixture.RoleService.UpdateRoleClaims(request, CancellationToken.None);

        Assert.True(result.IsSuccess);

        var updatedAssignedUser = await fixture.Context.Users
            .Include(u => u.RefreshTokens)
            .SingleAsync(u => u.Id == assignedUser.Id);
        var updatedUnassignedUser = await fixture.Context.Users
            .Include(u => u.RefreshTokens)
            .SingleAsync(u => u.Id == unassignedUser.Id);

        Assert.NotEqual(initialStampAssigned, updatedAssignedUser.SecurityStamp);
        Assert.All(updatedAssignedUser.RefreshTokens, token =>
        {
            Assert.NotNull(token.RevokedOn);
            Assert.Equal("Role permissions changed", token.RevocationReason);
        });

        Assert.Equal(initialStampUnassigned, updatedUnassignedUser.SecurityStamp);
        Assert.All(updatedUnassignedUser.RefreshTokens, token =>
        {
            Assert.Null(token.RevokedOn);
            Assert.True(token.IsActiveAt(DateTime.UtcNow));
        });

        Assert.Contains(fixture.BackgroundJobs.EnqueuedJobs, job =>
            job.Args.Count >= 2 &&
            string.Equals(job.Args[0]?.ToString(), assignedUser.Id, StringComparison.Ordinal));

        var audit = Assert.Single(fixture.SecurityAudit.RecordedAudits, a => a.Action == "RolePermissionsUpdated");
        Assert.Equal(role.Id, audit.TargetId);
        Assert.Equal("ApplicationRole", audit.TargetType);
        Assert.Equal(tenantId, audit.TenantId);
        Assert.Equal("1", audit.Metadata?["AffectedUsersCount"]);
    }

    [Fact]
    public async Task ToggleStatusAsync_WhenDeactivatingRole_RevokesActiveTokens_AndUpdatesSecurityStamp()
    {
        var tenantId = "tenant-sec-2";
        await using var fixture = await SecurityTestFixture.CreateAsync(tenantId);

        var role = new ApplicationRole("Auditors")
        {
            TenantId = tenantId,
            IsSystem = false
        };
        await fixture.RoleManager.CreateAsync(role);

        var user = fixture.CreateUser("user-auditor", tenantId);
        await fixture.UserManager.CreateAsync(user);

        fixture.AssignRole(user.Id, role.Id);
        await fixture.Context.SaveChangesAsync();

        var initialStamp = user.SecurityStamp;

        var result = await fixture.RoleService.ToggleStatusAsync(role.Id, CancellationToken.None);

        Assert.True(result.IsSuccess);

        var updatedRole = await fixture.RoleManager.FindByIdAsync(role.Id);
        Assert.NotNull(updatedRole);
        Assert.True(updatedRole.IsDeleted);

        var updatedUser = await fixture.Context.Users
            .Include(u => u.RefreshTokens)
            .SingleAsync(u => u.Id == user.Id);

        Assert.NotEqual(initialStamp, updatedUser.SecurityStamp);
        Assert.All(updatedUser.RefreshTokens, token =>
        {
            Assert.NotNull(token.RevokedOn);
            Assert.Equal("Role deactivated", token.RevocationReason);
        });

        Assert.Contains(fixture.BackgroundJobs.EnqueuedJobs, job =>
            job.Args.Count >= 2 &&
            string.Equals(job.Args[0]?.ToString(), user.Id, StringComparison.Ordinal));

        var audit = Assert.Single(fixture.SecurityAudit.RecordedAudits, a => a.Action == "RoleArchived");
        Assert.Equal(role.Id, audit.TargetId);
        Assert.Equal("ApplicationRole", audit.TargetType);
        Assert.Equal("1", audit.Metadata?["AffectedUsersCount"]);
    }

    [Fact]
    public async Task AddAsync_And_UpdateAsync_RecordSecurityAuditEvents()
    {
        var tenantId = "tenant-sec-3";
        await using var fixture = await SecurityTestFixture.CreateAsync(tenantId);

        var addResult = await fixture.RoleService.AddAsync(new RoleRequest(null, "HR Manager", null), CancellationToken.None);

        Assert.True(addResult.IsSuccess);
        var createdRoleId = addResult.Value.Id;

        var createAudit = Assert.Single(fixture.SecurityAudit.RecordedAudits, a => a.Action == "RoleCreated");
        Assert.Equal(createdRoleId, createAudit.TargetId);
        Assert.Equal("HR Manager", createAudit.Metadata?["RoleName"]);

        var updateResult = await fixture.RoleService.UpdateAsync(new RoleRequest(createdRoleId, "People Operations Lead", null), CancellationToken.None);

        Assert.True(updateResult.IsSuccess);

        var updateAudit = Assert.Single(fixture.SecurityAudit.RecordedAudits, a => a.Action == "RoleUpdated");
        Assert.Equal(createdRoleId, updateAudit.TargetId);
        Assert.Equal("HR Manager", updateAudit.Metadata?["PreviousName"]);
        Assert.Equal("People Operations Lead", updateAudit.Metadata?["NewName"]);
    }

    private sealed class SecurityTestFixture : IAsyncDisposable
    {
        public ApplicationDbContext Context { get; private set; } = null!;
        public RoleManager<ApplicationRole> RoleManager { get; private set; } = null!;
        public UserManager<ApplicationUser> UserManager { get; private set; } = null!;
        public RoleService RoleService { get; private set; } = null!;
        public TestSecurityAuditService SecurityAudit { get; } = new();
        public TestRealtimeChangeDispatcher RealtimeDispatcher { get; } = new();
        public TestBackgroundJobClient BackgroundJobs { get; } = new();
        private ServiceProvider _serviceProvider = null!;

        public static async Task<SecurityTestFixture> CreateAsync(string tenantId)
        {
            var fixture = new SecurityTestFixture();
            var services = new ServiceCollection();

            services.AddLogging(builder => builder.AddFilter(_ => false));
            services.AddSingleton(TimeProvider.System);
            services.AddSingleton<ICurrentActor>(new TestCurrentActor("actor-user", tenantId));

            var dbName = Guid.NewGuid().ToString("N");
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(dbName));

            services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.User.RequireUniqueEmail = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            services.AddSingleton<IStringLocalizer<RoleRequest>>(new TestStringLocalizer<RoleRequest>());
            services.AddScoped<RoleErrors>();

            fixture._serviceProvider = services.BuildServiceProvider();
            fixture.Context = fixture._serviceProvider.GetRequiredService<ApplicationDbContext>();
            fixture.RoleManager = fixture._serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            fixture.UserManager = fixture._serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            var tenant = new Tenant(tenantId, tenantId, "Test Tenant", DateTime.UtcNow);
            fixture.Context.Tenants.Add(tenant);
            await fixture.Context.SaveChangesAsync();

            var notifier = new SessionRevocationNotifier(fixture.BackgroundJobs);
            var roleErrors = fixture._serviceProvider.GetRequiredService<RoleErrors>();
            var currentActor = fixture._serviceProvider.GetRequiredService<ICurrentActor>();

            fixture.RoleService = new RoleService(
                fixture.RoleManager,
                roleErrors,
                fixture.RealtimeDispatcher,
                currentActor,
                fixture.Context,
                fixture.UserManager,
                fixture.SecurityAudit,
                notifier,
                TimeProvider.System);

            return fixture;
        }

        public ApplicationUser CreateUser(string userName, string tenantId)
        {
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString("N"),
                UserName = userName,
                Email = $"{userName}@example.com",
                TenantId = tenantId,
                FirstName = "Test",
                LastName = "User",
                SecurityStamp = Guid.NewGuid().ToString("N")
            };

            var now = DateTime.UtcNow;
            user.RefreshTokens.Add(RefreshToken.Create(
                "hash-" + Guid.NewGuid().ToString("N"),
                Guid.NewGuid().ToString("N"),
                Guid.NewGuid().ToString("N"),
                1,
                now.AddMinutes(-5),
                now.AddDays(7),
                "127.0.0.1",
                "TestAgent"));

            return user;
        }

        public void AssignRole(string userId, string roleId)
        {
            Context.UserRoles.Add(new IdentityUserRole<string>
            {
                UserId = userId,
                RoleId = roleId
            });
        }

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await _serviceProvider.DisposeAsync();
        }
    }

    private sealed class TestCurrentActor(string? userId, string? tenantId) : ICurrentActor
    {
        public string? UserId => userId;
        public string? TenantId => tenantId;
        public int? CompanyId => 1;
        public string? UserType => null;
    }

    private sealed class TestStringLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, string.Format(name, arguments));
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }

    private sealed class TestSecurityAuditService : ISecurityAuditService
    {
        public List<SecurityAuditRequest> RecordedAudits { get; } = [];
        public void Add(SecurityAuditRequest request) => RecordedAudits.Add(request);
        public Task RecordAsync(SecurityAuditRequest request, CancellationToken cancellationToken = default)
        {
            RecordedAudits.Add(request);
            return Task.CompletedTask;
        }
    }

    private sealed class TestRealtimeChangeDispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> DispatchedRequests { get; } = [];
        public void Dispatch(RealtimeChangeRequest request) => DispatchedRequests.Add(request);
    }

    private sealed class TestBackgroundJobClient : IBackgroundJobClient
    {
        public List<Job> EnqueuedJobs { get; } = [];
        public string Create(Job job, IState state)
        {
            EnqueuedJobs.Add(job);
            return Guid.NewGuid().ToString();
        }
        public bool ChangeState(string jobId, IState state, string expectedState) => true;
    }
}
