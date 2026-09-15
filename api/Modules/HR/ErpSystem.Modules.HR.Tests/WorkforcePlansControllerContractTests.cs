using System.Reflection;
using ErpSystem.Modules.HR.Presentation.Features.WorkforcePlanning.V1;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.BuildingBlocks.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace ErpSystem.Modules.HR.Tests;

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

        AssertRoute<HttpGetAttribute>(nameof(WorkforcePlansController.GetPage), null, HrPermissions.ViewWorkforcePlans);
        AssertRoute<HttpGetAttribute>(nameof(WorkforcePlansController.GetById), "{id:int}", HrPermissions.ViewWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Create), null, HrPermissions.CreateWorkforcePlans);
        AssertRoute<HttpPutAttribute>(nameof(WorkforcePlansController.Update), "{id:int}", HrPermissions.EditWorkforcePlans);
        AssertRoute<HttpDeleteAttribute>(nameof(WorkforcePlansController.Archive), "{id:int}", HrPermissions.DeleteWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Restore), "{id:int}/restore", HrPermissions.DeleteWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Submit), "{id:int}/submit", HrPermissions.EditWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.BeginReview), "{id:int}/begin-review", HrPermissions.ApproveWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Approve), "{id:int}/approve", HrPermissions.ApproveWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.Reject), "{id:int}/reject", HrPermissions.ApproveWorkforcePlans);
        AssertRoute<HttpPostAttribute>(nameof(WorkforcePlansController.CreateRevision), "{id:int}/revisions", HrPermissions.CreateWorkforcePlans);
        AssertRoute<HttpGetAttribute>(nameof(WorkforcePlansController.GetRevisions), "{id:int}/revisions", HrPermissions.ViewWorkforcePlans);
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

