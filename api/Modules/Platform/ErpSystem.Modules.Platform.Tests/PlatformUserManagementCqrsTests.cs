using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Commands;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Queries;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Presentation.Features.Security.Users.V1;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformUserManagementCqrsTests
{
    [Fact]
    public void UsersController_IsSenderOnlyAndLegacyUserServiceIsRemoved()
    {
        var parameters = Assert.Single(typeof(UsersController).GetConstructors())
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.Equal([typeof(ISender)], parameters);
        Assert.Null(typeof(UserManagementWriteStore).Assembly.GetType(
            "ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Services.UserService"));
        Assert.Null(typeof(GetUsersPageQuery).Assembly.GetType(
            "ErpSystem.Modules.Platform.Application.Features.Security.Users.Services.IUserService"));

        Assert.IsAssignableFrom<IQuery<PageResponse<UserResponse>>>(
            new GetUsersPageQuery(new UserManagementQuery()));
        Assert.IsAssignableFrom<IQuery<IReadOnlyList<UserResponse>>>(new GetAllUsersQuery());
        Assert.IsAssignableFrom<IQuery<IReadOnlyCollection<UserCompanyOptionResponse>>>(
            new GetUserCompanyOptionsQuery());
        Assert.IsAssignableFrom<IQuery<Result<UserResponse>>>(new GetUserByIdQuery("user-1"));
        Assert.IsAssignableFrom<ICommand<Result<UserResponse>>>(
            new CreateUserCommand(new CreateUserRequest(
                "First", "Last", "user", "user@example.com", "Password1!", ["user"], [1], 1)));
        Assert.IsAssignableFrom<ICommand<Result>>(
            new UpdateUserCommand("user-1", new UpdateUserRequest(
                "First", "Last", "user", "user@example.com", ["user"], [1], 1)));
        Assert.IsAssignableFrom<ICommand<Result>>(
            new ChangeManagedUserPasswordCommand(
                "user-1",
                new ChangeUserPasswordRequest("Password2!", "Password2!")));
        Assert.IsAssignableFrom<ICommand<Result>>(new ToggleUserStatusCommand("user-1"));
        Assert.IsAssignableFrom<ICommand<Result>>(new UnlockUserCommand("user-1"));
        Assert.IsAssignableFrom<ICommand<Result>>(
            new ArchiveUserCommand("user-1", new ArchiveUserRequest("reason")));
        Assert.IsAssignableFrom<ICommand<Result>>(new RestoreUserCommand("user-1"));
    }

    [Fact]
    public void UsersController_PreservesRoutesAndPermissions()
    {
        AssertRoute<HttpGetAttribute>(nameof(UsersController.GetPage), null, PlatformPermissions.ViewUsers);
        AssertRoute<HttpGetAttribute>(nameof(UsersController.GetAll), null, PlatformPermissions.ViewUsers);
        AssertRoute<HttpGetAttribute>(nameof(UsersController.GetCompanyOptions), null, PlatformPermissions.ViewUsers);
        AssertRoute<HttpGetAttribute>(nameof(UsersController.Get), "{id}", PlatformPermissions.ViewUsers);
        AssertRoute<HttpPostAttribute>(nameof(UsersController.Add), null, PlatformPermissions.CreateUsers);
        AssertRoute<HttpPutAttribute>(nameof(UsersController.Update), "{id}", PlatformPermissions.EditUsers);
        AssertRoute<HttpPutAttribute>(nameof(UsersController.ChangePassword), "{id}", PlatformPermissions.EditUsers);
        AssertRoute<HttpPutAttribute>(nameof(UsersController.Toggle), "{id}", PlatformPermissions.EditUsers);
        AssertRoute<HttpPutAttribute>(nameof(UsersController.Unlock), "{id}", PlatformPermissions.EditUsers);
        AssertRoute<HttpPostAttribute>(
            nameof(UsersController.Archive),
            "~/api/v{version:apiVersion}/users/archive/{id}",
            PlatformPermissions.DeleteUsers);
        AssertRoute<HttpPostAttribute>(
            nameof(UsersController.Restore),
            "~/api/v{version:apiVersion}/users/restore/{id}",
            PlatformPermissions.DeleteUsers);
    }

    [Fact]
    public async Task UserManagementCommandHandlers_DelegateToWriteStoreWithCancellation()
    {
        var store = new RecordingWriteStore();
        var token = new CancellationTokenSource().Token;
        var createRequest = new CreateUserRequest(
            "First", "Last", "user", "user@example.com", "Password1!", ["user"], [1], 1);
        var updateRequest = new UpdateUserRequest(
            "First", "Last", "user", "user@example.com", ["user"], [1], 1);

        await new CreateUserCommandHandler(store).Handle(new CreateUserCommand(createRequest), token);
        await new UpdateUserCommandHandler(store).Handle(new UpdateUserCommand("user-1", updateRequest), token);
        await new ChangeManagedUserPasswordCommandHandler(store).Handle(
            new ChangeManagedUserPasswordCommand(
                "user-1",
                new ChangeUserPasswordRequest("Password2!", "Password2!")),
            token);
        await new ToggleUserStatusCommandHandler(store).Handle(new ToggleUserStatusCommand("user-1"), token);
        await new UnlockUserCommandHandler(store).Handle(new UnlockUserCommand("user-1"), token);
        await new ArchiveUserCommandHandler(store).Handle(
            new ArchiveUserCommand("user-1", new ArchiveUserRequest("reason")), token);
        await new RestoreUserCommandHandler(store).Handle(new RestoreUserCommand("user-1"), token);

        Assert.Equal(
            ["create", "update:user-1", "password:user-1", "toggle:user-1", "unlock:user-1", "archive:user-1", "restore:user-1"],
            store.Calls);
        Assert.All(store.Tokens, captured => Assert.Equal(token, captured));
    }

    [Fact]
    public async Task PageResponse_DoesNotLeakCompanyAccessFromAnotherTenant()
    {
        var actor = new MutableActor("actor", "tenant-a", null);
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new PlatformDbContext(options, actor);

        var companyA = new PlatformCompany(
            "tenant-a", "A", "Company A", "شركة أ", "EGP", "Africa/Cairo", DateTime.UtcNow);
        var companyB = new PlatformCompany(
            "tenant-b", "B", "Company B", "شركة ب", "EGP", "Africa/Cairo", DateTime.UtcNow);
        context.Companies.AddRange(companyA, companyB);
        await context.SaveChangesAsync();
        actor.CompanyId = companyA.Id;

        var actorUser = User("actor", "Actor", "actor@example.com");
        var targetUser = User("target", "Target", "target@example.com");
        context.Users.AddRange(actorUser, targetUser);
        context.UserTenantAccesses.AddRange(
            new PlatformUserTenantAccess { TenantId = "tenant-a", UserId = actorUser.Id, IsDefault = true },
            new PlatformUserTenantAccess { TenantId = "tenant-a", UserId = targetUser.Id, IsDefault = true });
        context.UserCompanyAccesses.AddRange(
            new PlatformUserCompanyAccess
            {
                TenantId = "tenant-a",
                UserId = actorUser.Id,
                CompanyId = companyA.Id,
                IsDefault = true
            },
            new PlatformUserCompanyAccess
            {
                TenantId = "tenant-a",
                UserId = targetUser.Id,
                CompanyId = companyA.Id,
                IsDefault = true
            },
            new PlatformUserCompanyAccess
            {
                TenantId = "tenant-b",
                UserId = targetUser.Id,
                CompanyId = companyB.Id,
                IsDefault = true
            });
        await context.SaveChangesAsync();

        IUserManagementReadStore store = new UserManagementReadStore(
            context,
            actor,
            TimeProvider.System,
            new TenantRoleAssignmentService(context));

        var page = await store.GetPageAsync(
            new UserManagementQuery { PageNumber = 1, PageSize = 20 },
            CancellationToken.None);

        var target = Assert.Single(page.Items, user => user.Id == targetUser.Id);
        Assert.Equal([companyA.Id], target.CompanyIds);
        Assert.Equal(companyA.Id, target.DefaultCompanyId);
        Assert.DoesNotContain(companyB.Id, target.CompanyIds);
    }

    private static PlatformApplicationUser User(string id, string firstName, string email) =>
        new()
        {
            Id = id,
            FirstName = firstName,
            LastName = "User",
            UserName = email,
            NormalizedUserName = email.ToUpperInvariant(),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            LifecycleStatus = 0
        };

    private sealed class MutableActor(
        string? userId,
        string? tenantId,
        int? companyId) : ICurrentActor
    {
        public string? UserId { get; set; } = userId;
        public string? TenantId { get; set; } = tenantId;
        public int? CompanyId { get; set; } = companyId;
    }

    private static void AssertRoute<TAttribute>(
        string actionName,
        string? expectedTemplate,
        string expectedPermission)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(UsersController).GetMethod(actionName)!;
        var attribute = Assert.Single(
            method.GetCustomAttributes(typeof(TAttribute), inherit: false).Cast<TAttribute>());
        Assert.Equal(expectedTemplate, attribute.Template);
        Assert.Equal(
            expectedPermission,
            method.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    private sealed class RecordingWriteStore : IUserManagementWriteStore
    {
        public List<string> Calls { get; } = [];
        public List<CancellationToken> Tokens { get; } = [];

        public Task<Result<UserResponse>> CreateAsync(
            CreateUserRequest request,
            CancellationToken cancellationToken = default)
        {
            Record("create", cancellationToken);
            return Task.FromResult(Result.Success(new UserResponse(
                "user-1", request.FirstName, request.LastName, request.UserName, request.Email,
                false, false, null, request.Roles.ToArray(), request.CompanyIds.ToArray(),
                request.DefaultCompanyId, "active", null, null)));
        }

        public Task<Result> UpdateAsync(
            string id,
            UpdateUserRequest request,
            CancellationToken cancellationToken = default) =>
            Success($"update:{id}", cancellationToken);

        public Task<Result> ChangePasswordAsync(
            string id,
            ChangeUserPasswordRequest request,
            CancellationToken cancellationToken = default) =>
            Success($"password:{id}", cancellationToken);

        public Task<Result> ToggleStatusAsync(
            string id,
            CancellationToken cancellationToken = default) =>
            Success($"toggle:{id}", cancellationToken);

        public Task<Result> UnlockAsync(
            string id,
            CancellationToken cancellationToken = default) =>
            Success($"unlock:{id}", cancellationToken);

        public Task<Result> ArchiveAsync(
            string id,
            ArchiveUserRequest request,
            CancellationToken cancellationToken = default) =>
            Success($"archive:{id}", cancellationToken);

        public Task<Result> RestoreAsync(
            string id,
            CancellationToken cancellationToken = default) =>
            Success($"restore:{id}", cancellationToken);

        private Task<Result> Success(string call, CancellationToken token)
        {
            Record(call, token);
            return Task.FromResult(Result.Success());
        }

        private void Record(string call, CancellationToken token)
        {
            Calls.Add(call);
            Tokens.Add(token);
        }
    }
}
