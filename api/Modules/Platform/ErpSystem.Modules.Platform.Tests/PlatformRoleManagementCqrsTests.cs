using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Commands;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Queries;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Modules;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Presentation.Features.Security.Authorization.V1;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Localization;
using System.Reflection;
using System.Runtime.CompilerServices;
using PlatformSecurityAuditRequest = ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditRequest;
using PlatformSecurityAuditService = ErpSystem.Modules.Platform.Contracts.SecurityAudits.ISecurityAuditService;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformRoleManagementCqrsTests
{
    [Fact]
    public void RolesController_IsSenderOnlyAndLegacyRoleServiceIsRemoved()
    {
        var parameters = Assert.Single(typeof(RolesController).GetConstructors())
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.Equal([typeof(ISender)], parameters);
        Assert.Null(typeof(RoleRepository).Assembly.GetType(
            "ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services.RoleService"));
        Assert.Null(typeof(GetAllRolesQuery).Assembly.GetType(
            "ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Services.IRoleService"));

        Assert.IsAssignableFrom<IQuery<IReadOnlyList<RoleResponse>>>(new GetAllRolesQuery());
        Assert.IsAssignableFrom<IQuery<Result<RoleDetailResponse>>>(new GetRoleQuery("role-1"));
        Assert.IsAssignableFrom<IQuery<Result<RoleResponse>>>(new GetRoleClaimsQuery("role-1"));
        Assert.IsAssignableFrom<ICommand<Result<RoleResponse>>>(
            new CreateRoleCommand(new RoleRequest(null, "Auditor", null)));
        Assert.IsAssignableFrom<ICommand<Result>>(
            new UpdateRoleCommand(new RoleRequest("role-1", "Auditor", null)));
        Assert.IsAssignableFrom<ICommand<Result>>(new ToggleRoleStatusCommand("role-1"));
        Assert.IsAssignableFrom<ICommand<Result>>(
            new UpdateRoleClaimsCommand(new RoleRequest("role-1", "Auditor", [])));
    }

    [Fact]
    public void RolesController_PreservesRoutesAndPermissions()
    {
        AssertRoute<HttpGetAttribute>(nameof(RolesController.GetAll), null, PlatformPermissions.ViewRoles);
        AssertRoute<HttpGetAttribute>(nameof(RolesController.Get), "{id}", PlatformPermissions.ViewRoles);
        AssertRoute<HttpPostAttribute>(nameof(RolesController.Add), string.Empty, PlatformPermissions.CreateRoles);
        AssertRoute<HttpPutAttribute>(nameof(RolesController.Update), null, PlatformPermissions.EditRoles);
        AssertRoute<HttpPutAttribute>(nameof(RolesController.Toggle), "{id}", PlatformPermissions.DeleteRoles);
        AssertRoute<HttpGetAttribute>(nameof(RolesController.GetRoleClaims), null, PlatformPermissions.ViewRoles);
        AssertRoute<HttpPutAttribute>(nameof(RolesController.UpdateRoleClaims), null, PlatformPermissions.EditRoles);
    }

    [Fact]
    public async Task RolesController_DelegatesThroughMediatRAndPreservesSuccessStatusCodes()
    {
        var sender = new RecordingSender();
        var controller = new RolesController(sender);
        var create = new RoleRequest(null, "Auditor", null);
        var update = new RoleRequest("role-1", "Auditor 2", null);
        var claims = new RoleRequest("role-1", "Auditor 2", [new CheckBoxViewModel
        {
            DisplayValue = PlatformPermissions.ViewRoles,
            IsSelected = true
        }]);

        Assert.IsType<OkObjectResult>(await controller.GetAll(CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Get("role-1", CancellationToken.None));

        var created = Assert.IsType<CreatedAtActionResult>(
            await controller.Add(create, CancellationToken.None));
        Assert.Equal(nameof(RolesController.Get), created.ActionName);
        Assert.Equal("role-1", created.RouteValues!["Id"]);

        Assert.IsType<NoContentResult>(await controller.Update(update, CancellationToken.None));
        Assert.IsType<NoContentResult>(await controller.Toggle("role-1", CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetRoleClaims(new RoleIdQuery("role-1"), CancellationToken.None));
        Assert.IsType<NoContentResult>(await controller.UpdateRoleClaims(claims, CancellationToken.None));

        Assert.Collection(
            sender.Requests,
            request => Assert.IsType<GetAllRolesQuery>(request),
            request => Assert.Equal("role-1", Assert.IsType<GetRoleQuery>(request).Id),
            request => Assert.Same(create, Assert.IsType<CreateRoleCommand>(request).Request),
            request => Assert.Same(update, Assert.IsType<UpdateRoleCommand>(request).Request),
            request => Assert.Equal("role-1", Assert.IsType<ToggleRoleStatusCommand>(request).Id),
            request => Assert.Equal("role-1", Assert.IsType<GetRoleClaimsQuery>(request).RoleId),
            request => Assert.Same(claims, Assert.IsType<UpdateRoleClaimsCommand>(request).Request));
    }

    [Fact]
    public async Task GetAllRoles_RequiresTenantBeforeTouchingPersistence()
    {
        var store = new RecordingReadStore();
        var handler = new GetAllRolesQueryHandler(store, new Actor("actor", null, 1));

        var roles = await handler.Handle(new GetAllRolesQuery(), CancellationToken.None);

        Assert.Empty(roles);
        Assert.Equal(0, store.CallCount);
    }

    [Fact]
    public async Task GetRoleClaims_BuildsSelectionOnlyFromTenantAssignablePermissions()
    {
        var store = new RecordingReadStore
        {
            Claims = new RoleClaimsSnapshot(
                "role-1",
                "Auditor",
                false,
                false,
                ["permission.allowed", "permission.unavailable"])
        };
        var catalog = new StubModuleCatalogPolicy(["permission.allowed", "permission.other"]);
        var handler = new GetRoleClaimsQueryHandler(
            store,
            new Actor("actor", "tenant-a", 1),
            catalog,
            Errors());

        var result = await handler.Handle(new GetRoleClaimsQuery("role-1"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Collection(
            result.Value.RoleClaims!,
            claim =>
            {
                Assert.Equal("permission.allowed", claim.DisplayValue);
                Assert.True(claim.IsSelected);
            },
            claim =>
            {
                Assert.Equal("permission.other", claim.DisplayValue);
                Assert.False(claim.IsSelected);
            });
    }

    [Theory]
    [InlineData(PlatformRoleNames.SuperAdmin)]
    [InlineData(PlatformRoleNames.Admin)]
    [InlineData(PlatformRoleNames.User)]
    public async Task CreateRole_RejectsReservedSystemNamesBeforePersistence(string reservedName)
    {
        var repository = new RecordingRoleRepository();
        var unitOfWork = new RecordingRoleUnitOfWork();
        var effects = new RecordingRoleEffects();
        var handler = new CreateRoleCommandHandler(
            repository,
            unitOfWork,
            new RoleLockResourceFactory(),
            effects,
            new Actor("actor", "tenant-a", 1),
            new RecordingSecurityAuditService(),
            Errors());

        var result = await handler.Handle(
            new CreateRoleCommand(new RoleRequest(null, reservedName, null)),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Role.RoleNotFound", result.Error.Code);
        Assert.Equal(0, repository.CreateCount);
        Assert.Equal(0, unitOfWork.ExecuteCount);
        Assert.Empty(effects.RoleChanges);
    }

    [Fact]
    public async Task CreateRole_UsesAtomicPlatformLock_AuditsBeforeCommit_ThenPublishesAfterCommit()
    {
        var repository = new RecordingRoleRepository();
        var unitOfWork = new RecordingRoleUnitOfWork();
        var effects = new RecordingRoleEffects();
        var audit = new RecordingSecurityAuditService();
        var handler = new CreateRoleCommandHandler(
            repository,
            unitOfWork,
            new RoleLockResourceFactory(),
            effects,
            new Actor("actor", "tenant-a", 1),
            audit,
            Errors());

        var result = await handler.Handle(
            new CreateRoleCommand(new RoleRequest(null, "Auditor", null)),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("role-1", result.Value.Id);
        Assert.Equal(1, repository.CreateCount);
        Assert.Equal(1, unitOfWork.ExecuteCount);
        Assert.Equal(1, unitOfWork.SaveCount);
        Assert.Single(unitOfWork.LockResources);
        Assert.StartsWith("ErpSystem:Platform:Role:", unitOfWork.LockResources[0], StringComparison.Ordinal);
        var auditRecord = Assert.Single(audit.Added);
        Assert.Equal("RoleCreated", auditRecord.Action);
        Assert.Equal("tenant-a", auditRecord.TenantId);
        Assert.Equal([("tenant-a", "role-1", "Create")], effects.RoleChanges);
    }

    [Fact]
    public async Task UpdateRoleClaims_RejectsUnknownOrDuplicatePermissionsBeforeTransaction()
    {
        var repository = new RecordingRoleRepository();
        var unitOfWork = new RecordingRoleUnitOfWork();
        var effects = new RecordingRoleEffects();
        var handler = new UpdateRoleClaimsCommandHandler(
            repository,
            unitOfWork,
            new RoleLockResourceFactory(),
            effects,
            new Actor("actor", "tenant-a", 1),
            new StubModuleCatalogPolicy(["permission.allowed"]),
            new RecordingSecurityAuditService(),
            Errors(),
            TimeProvider.System);

        var unknown = await handler.Handle(
            new UpdateRoleClaimsCommand(new RoleRequest("role-1", "Auditor", [new CheckBoxViewModel
            {
                DisplayValue = "permission.unknown",
                IsSelected = true
            }])),
            CancellationToken.None);
        var duplicate = await handler.Handle(
            new UpdateRoleClaimsCommand(new RoleRequest("role-1", "Auditor",
            [
                new CheckBoxViewModel { DisplayValue = "permission.allowed", IsSelected = true },
                new CheckBoxViewModel { DisplayValue = "permission.allowed", IsSelected = true }
            ])),
            CancellationToken.None);

        Assert.True(unknown.IsFailure);
        Assert.Equal("Role.InvalidPermissions", unknown.Error.Code);
        Assert.True(duplicate.IsFailure);
        Assert.Equal("Role.InvalidPermissions", duplicate.Error.Code);
        Assert.Equal(0, repository.ReplaceClaimsCount);
        Assert.Equal(0, unitOfWork.ExecuteCount);
        Assert.Empty(effects.RoleChanges);
    }

    private static RoleErrors Errors() => new(new PassThroughLocalizer<RoleRequest>());

    private static void AssertRoute<TAttribute>(
        string actionName,
        string? expectedTemplate,
        string expectedPermission)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(RolesController).GetMethod(actionName)!;
        var attribute = Assert.Single(
            method.GetCustomAttributes(typeof(TAttribute), inherit: false).Cast<TAttribute>());
        Assert.Equal(expectedTemplate, attribute.Template);
        Assert.Equal(expectedPermission, method.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    private sealed class Actor(string? userId, string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class RecordingReadStore : IRoleManagementReadStore
    {
        public int CallCount { get; private set; }
        public RoleClaimsSnapshot? Claims { get; init; }

        public Task<IReadOnlyList<RoleResponse>> GetAllAsync(
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            CallCount++;
            return Task.FromResult<IReadOnlyList<RoleResponse>>([]);
        }

        public Task<RoleDetailResponse?> GetByIdAsync(
            string tenantId,
            string id,
            CancellationToken cancellationToken = default)
        {
            CallCount++;
            return Task.FromResult<RoleDetailResponse?>(null);
        }

        public Task<RoleClaimsSnapshot?> GetClaimsAsync(
            string tenantId,
            string roleId,
            CancellationToken cancellationToken = default)
        {
            CallCount++;
            return Task.FromResult(Claims);
        }
    }

    private sealed class RecordingRoleRepository : IRoleRepository
    {
        public int CreateCount { get; private set; }
        public int ReplaceClaimsCount { get; private set; }

        public string NormalizeName(string roleName) => roleName.Trim().ToUpperInvariant();

        public Task<Result<RoleMutationSnapshot>> CreateAsync(
            string tenantId,
            string roleName,
            CancellationToken cancellationToken = default)
        {
            CreateCount++;
            return Task.FromResult(Result.Success(new RoleMutationSnapshot("role-1", roleName, false, false)));
        }

        public Task<Result<RoleRenameSnapshot>> RenameAsync(
            string tenantId,
            string roleId,
            string roleName,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(Result.Success(new RoleRenameSnapshot(
                new RoleMutationSnapshot(roleId, roleName, false, false),
                "Old")));

        public Task<Result<RoleStatusMutationSnapshot>> ToggleStatusAsync(
            string tenantId,
            string roleId,
            string revocationReason,
            DateTime utcNow,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(Result.Success(new RoleStatusMutationSnapshot(
                new RoleMutationSnapshot(roleId, "Auditor", true, false),
                ["user-1"])));

        public Task<Result<RoleClaimsMutationSnapshot>> ReplaceClaimsAsync(
            string tenantId,
            string roleId,
            IReadOnlyCollection<string> permissions,
            string revocationReason,
            DateTime utcNow,
            CancellationToken cancellationToken = default)
        {
            ReplaceClaimsCount++;
            return Task.FromResult(Result.Success(new RoleClaimsMutationSnapshot(
                new RoleMutationSnapshot(roleId, "Auditor", false, false),
                [],
                permissions,
                ["user-1"])));
        }
    }

    private sealed class RecordingRoleUnitOfWork : IRoleUnitOfWork
    {
        public int ExecuteCount { get; private set; }
        public int SaveCount { get; private set; }
        public List<string> LockResources { get; } = [];

        public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default)
        {
            ExecuteCount++;
            LockResources.AddRange(lockResources);
            return await operation(cancellationToken);
        }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveCount++;
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingRoleEffects : IRolePostCommitEffects
    {
        public List<(string TenantId, string RoleId, string Action)> RoleChanges { get; } = [];

        public void PublishRoleChanged(string tenantId, string roleId, string action) =>
            RoleChanges.Add((tenantId, roleId, action));

        public void PublishRoleClaimsChanged(string tenantId, string roleId) =>
            RoleChanges.Add((tenantId, roleId, "PermissionsChanged"));

        public void QueueSessionRevocations(
            IReadOnlyCollection<string> userIds,
            string notificationMessage)
        {
        }
    }

    private sealed class RecordingSecurityAuditService : PlatformSecurityAuditService
    {
        public List<PlatformSecurityAuditRequest> Added { get; } = [];

        public void Add(PlatformSecurityAuditRequest request) => Added.Add(request);

        public Task RecordAsync(
            PlatformSecurityAuditRequest request,
            CancellationToken cancellationToken = default)
        {
            Added.Add(request);
            return Task.CompletedTask;
        }
    }

    private sealed class StubModuleCatalogPolicy(IReadOnlyCollection<string> assignablePermissions)
        : IModuleCatalogPolicy
    {
        private readonly IReadOnlySet<string> _assignablePermissions =
            assignablePermissions.ToHashSet(StringComparer.Ordinal);

        public IReadOnlyList<ModuleCatalogItem> GetInstalled() => [];
        public IReadOnlyList<ModuleCatalogItem> GetTenantEntitlementCatalog() => [];
        public IReadOnlyList<TenantModuleEntitlementRequest> GetDefaultEntitlements() => [];

        public Task<IReadOnlyList<ModuleCatalogItem>> GetAccessibleAsync(
            string userId,
            string tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<ModuleCatalogItem>>([]);

        public IReadOnlySet<string> GetKnownPermissions() => _assignablePermissions;
        public IReadOnlySet<string> GetTenantAssignablePermissions() => _assignablePermissions;

        public bool TryResolvePermission(string permission, out ModulePermissionCatalogItem resolvedPermission)
        {
            resolvedPermission = default!;
            return false;
        }

        public Task<bool> IsSuperAdminAsync(
            string userId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public bool IsValidEntitlement(
            IReadOnlyCollection<TenantModuleEntitlementRequest> entitlements,
            out string? invalidCode)
        {
            invalidCode = null;
            return true;
        }
    }

    private sealed class PassThroughLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, resourceNotFound: false);

        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(System.Globalization.CultureInfo.InvariantCulture, name, arguments), resourceNotFound: false);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            var role = new RoleResponse("role-1", "Auditor", false, [], false);
            object response = request switch
            {
                GetAllRolesQuery => new List<RoleResponse> { role },
                GetRoleQuery => Result.Success(new RoleDetailResponse(
                    "role-1", "Auditor", false, [PlatformPermissions.ViewRoles], false)),
                CreateRoleCommand => Result.Success(role),
                UpdateRoleCommand => Result.Success(),
                ToggleRoleStatusCommand => Result.Success(),
                GetRoleClaimsQuery => Result.Success(role),
                UpdateRoleClaimsCommand => Result.Success(),
                _ => throw new NotSupportedException(request.GetType().FullName)
            };

            return Task.FromResult((TResponse)response);
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest =>
            throw new NotSupportedException();

        public Task<object?> Send(object request, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
            IStreamRequest<TResponse> request,
            CancellationToken cancellationToken = default) =>
            Empty<TResponse>(cancellationToken);

        public IAsyncEnumerable<object?> CreateStream(
            object request,
            CancellationToken cancellationToken = default) =>
            Empty<object?>(cancellationToken);

        private static async IAsyncEnumerable<T> Empty<T>(
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            cancellationToken.ThrowIfCancellationRequested();
            yield break;
        }
    }
}
