using System.Reflection;
using HrManagementSystem.Api.Features.WorkforcePlanning.V1;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace HrManagementSystem.Tests;

public sealed class WorkforcePlansControllerContractTests
{
    [Fact]
    public void Controller_IsThinTenantMemberSurfaceWithExactRoutesAndPermissions()
    {
        var constructor = Assert.Single(typeof(WorkforcePlansController).GetConstructors());
        Assert.Equal([typeof(ISender)], constructor.GetParameters().Select(parameter => parameter.ParameterType));
        Assert.NotNull(typeof(WorkforcePlansController).GetCustomAttribute<TenantMemberAttribute>());
        Assert.Equal("api/v{version:apiVersion}/workforce-planning/plans",
            Assert.Single(typeof(WorkforcePlansController).GetCustomAttributes<RouteAttribute>()).Template);

        AssertRoute<HttpGetAttribute>(nameof(WorkforcePlansController.GetPage), null, Permissions.ViewWorkforcePlans);
        AssertRoute<HttpGetAttribute>(nameof(WorkforcePlansController.GetById), "{id:int}", Permissions.ViewWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Create), null, Permissions.CreateWorkforcePlans);
        AssertRoute<HttpPutAttribute>(nameof(WorkforcePlansController.Update), "{id:int}", Permissions.EditWorkforcePlans);
        AssertRoute<HttpDeleteAttribute>(nameof(WorkforcePlansController.Archive), "{id:int}", Permissions.DeleteWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Restore), "{id:int}/restore", Permissions.DeleteWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Submit), "{id:int}/submit", Permissions.EditWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.BeginReview), "{id:int}/begin-review", Permissions.ApproveWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Approve), "{id:int}/approve", Permissions.ApproveWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Reject), "{id:int}/reject", Permissions.ApproveWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.CreateRevision), "{id:int}/revisions", Permissions.CreateWorkforcePlans);
        AssertRoute<HttpGetAttribute>(nameof(WorkforcePlansController.GetRevisions), "{id:int}/revisions", Permissions.ViewWorkforcePlans);
    }

    [Fact]
    public void EveryLifecycleMutation_RequiresTheConcurrencyContract()
    {
        foreach (var action in new[]
                 {
                     nameof(WorkforcePlansController.Submit),
                     nameof(WorkforcePlansController.BeginReview),
                     nameof(WorkforcePlansController.Approve),
                     nameof(WorkforcePlansController.CreateRevision),
                     nameof(WorkforcePlansController.Archive),
                     nameof(WorkforcePlansController.Restore)
                 })
        {
            var parameters = typeof(WorkforcePlansController).GetMethod(action)!.GetParameters();
            Assert.Contains(parameters, parameter => parameter.ParameterType == typeof(WorkforcePlanActionRequest));
        }

        Assert.Contains(
            typeof(WorkforcePlansController).GetMethod(nameof(WorkforcePlansController.Reject))!.GetParameters(),
            parameter => parameter.ParameterType == typeof(RejectWorkforcePlanRequest));
    }

    private static void AssertRoute<TAttribute>(string action, string? template, string permission)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(WorkforcePlansController).GetMethod(action)!;
        Assert.Equal(template, Assert.Single(method.GetCustomAttributes<TAttribute>()).Template);
        Assert.Equal(permission, method.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }
}
