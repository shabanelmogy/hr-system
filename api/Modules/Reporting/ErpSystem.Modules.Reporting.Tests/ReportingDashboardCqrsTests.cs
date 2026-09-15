using System.Reflection;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Dashboard.Queries;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.Dashboard.V1;
using MediatR;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class ReportingDashboardCqrsTests
{
    [Fact]
    public void Controller_IsThinMediatRAdapter_AndLegacyServiceIsGone()
    {
        var constructor = Assert.Single(typeof(DashboardController).GetConstructors(BindingFlags.Public | BindingFlags.Instance));
        var parameter = Assert.Single(constructor.GetParameters());
        Assert.Equal(typeof(ISender), parameter.ParameterType);

        var application = typeof(GetUsersCountQuery).Assembly;
        Assert.Null(application.GetType(
            "ErpSystem.Modules.Reporting.Application.Features.Analytics.Dashboard.Services.IDashboardService"));

        var infrastructure = typeof(ErpSystem.Modules.Reporting.Infrastructure.ReportingDbContext).Assembly;
        Assert.Null(infrastructure.GetType(
            "ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Dashboard.Services.DashboardService"));
    }

    [Fact]
    public async Task QueryHandler_UsesPlatformPublicContract_AndReturnsCount()
    {
        var source = new StubAuthorizationSource(37);
        var handler = new GetUsersCountQueryHandler(source);

        var result = await handler.Handle(new GetUsersCountQuery(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(37, result.Value.Count);
        Assert.Equal(1, source.UserCountCalls);
    }

    private sealed class StubAuthorizationSource(int count) : IPlatformAuthorizationSource
    {
        public int UserCountCalls { get; private set; }

        public Task<int> GetUserCountAsync(CancellationToken cancellationToken = default)
        {
            UserCountCalls++;
            return Task.FromResult(count);
        }

        public Task<IReadOnlyCollection<string>> GetUserRoleIdsAsync(
            string userId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<string>>([]);

        public Task<IReadOnlyCollection<PlatformRoleOption>> GetRolesAsync(
            IReadOnlyCollection<string> roleIds,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<PlatformRoleOption>>([]);

        public Task<IReadOnlyCollection<PlatformRoleOption>> GetAssignableRolesAsync(
            string? tenantId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<PlatformRoleOption>>([]);

        public Task<bool> AreRoleIdsValidAsync(
            string? tenantId,
            IReadOnlyCollection<string> roleIds,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(true);
    }
}
