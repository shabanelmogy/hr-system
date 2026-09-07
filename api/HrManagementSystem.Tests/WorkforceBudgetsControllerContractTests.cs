using System.Reflection;
using HrManagementSystem.Api.Features.WorkforcePlanning.V1;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace HrManagementSystem.Tests;

public sealed class WorkforceBudgetsControllerContractTests
{
    [Fact]
    public void Controllers_AreThinTenantMemberSurfacesWithExactRoutesAndAuthorization()
    {
        var budgetConstructor = Assert.Single(typeof(WorkforceBudgetsController).GetConstructors());
        Assert.Equal([typeof(ISender)], budgetConstructor.GetParameters().Select(parameter => parameter.ParameterType));
        Assert.NotNull(typeof(WorkforceBudgetsController).GetCustomAttribute<TenantMemberAttribute>());
        Assert.Equal("api/v{version:apiVersion}/workforce-planning/budgets",
            Assert.Single(typeof(WorkforceBudgetsController).GetCustomAttributes<RouteAttribute>()).Template);

        AssertBudgetRoute<HttpGetAttribute>(nameof(WorkforceBudgetsController.GetPage), null, Permissions.ViewWorkforceBudgets);
        AssertBudgetRoute<HttpGetAttribute>(nameof(WorkforceBudgetsController.GetById), "{id:int}", Permissions.ViewWorkforceBudgets);
        AssertBudgetRoute<HttpGetAttribute>(nameof(WorkforceBudgetsController.GetSourcePlans), "source-plans", Permissions.ViewWorkforceBudgets);
        AssertBudgetRoute<HttpGetAttribute>(nameof(WorkforceBudgetsController.GetSourcePlanById), "source-plans/{planId:int}", Permissions.ViewWorkforceBudgets);
        AssertBudgetRoute<HttpPostAttribute>(nameof(WorkforceBudgetsController.Create), null, Permissions.ManageWorkforceBudgets);
        AssertBudgetRoute<HttpPutAttribute>(nameof(WorkforceBudgetsController.Update), "{id:int}", Permissions.ManageWorkforceBudgets);
        AssertBudgetRoute<HttpPostAttribute>(nameof(WorkforceBudgetsController.Submit), "{id:int}/submit", Permissions.ManageWorkforceBudgets);
        AssertBudgetAdminRoute<HttpPostAttribute>(nameof(WorkforceBudgetsController.Approve), "{id:int}/approve");
        AssertBudgetRoute<HttpPostAttribute>(nameof(WorkforceBudgetsController.Reject), "{id:int}/reject", Permissions.ManageWorkforceBudgets);

        var envelopeConstructor = Assert.Single(typeof(PositionEnvelopesController).GetConstructors());
        Assert.Equal([typeof(ISender)], envelopeConstructor.GetParameters().Select(parameter => parameter.ParameterType));
        Assert.NotNull(typeof(PositionEnvelopesController).GetCustomAttribute<TenantMemberAttribute>());
        Assert.Equal("api/v{version:apiVersion}/workforce-planning/position-envelopes",
            Assert.Single(typeof(PositionEnvelopesController).GetCustomAttributes<RouteAttribute>()).Template);

        var page = typeof(PositionEnvelopesController).GetMethod(nameof(PositionEnvelopesController.GetPage))!;
        Assert.Null(Assert.Single(page.GetCustomAttributes<HttpGetAttribute>()).Template);
        Assert.Equal(Permissions.ViewPositionEnvelopes, page.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        var byId = typeof(PositionEnvelopesController).GetMethod(nameof(PositionEnvelopesController.GetById))!;
        Assert.Equal("{id:int}", Assert.Single(byId.GetCustomAttributes<HttpGetAttribute>()).Template);
        Assert.Equal(Permissions.ViewPositionEnvelopes, byId.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    [Fact]
    public void EveryBudgetMutation_RequiresTheConcurrencyContract()
    {
        foreach (var action in new[]
                 {
                     nameof(WorkforceBudgetsController.Submit),
                     nameof(WorkforceBudgetsController.Approve),
                     nameof(WorkforceBudgetsController.Update)
                 })
        {
            var parameters = typeof(WorkforceBudgetsController).GetMethod(action)!.GetParameters();
            Assert.Contains(parameters, parameter =>
                parameter.ParameterType == typeof(WorkforceBudgetActionRequest) ||
                parameter.ParameterType == typeof(UpdateWorkforceBudgetRequest));
        }

        Assert.Contains(
            typeof(WorkforceBudgetsController).GetMethod(nameof(WorkforceBudgetsController.Reject))!.GetParameters(),
            parameter => parameter.ParameterType == typeof(RejectWorkforceBudgetRequest));
    }

    private static void AssertBudgetRoute<TAttribute>(string action, string? template, string permission)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(WorkforceBudgetsController).GetMethod(action)!;
        Assert.Equal(template, Assert.Single(method.GetCustomAttributes<TAttribute>()).Template);
        Assert.Equal(permission, method.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    private static void AssertBudgetAdminRoute<TAttribute>(string action, string? template)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(WorkforceBudgetsController).GetMethod(action)!;
        Assert.Equal(template, Assert.Single(method.GetCustomAttributes<TAttribute>()).Template);
        Assert.Equal(AppRoles.admin, method.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
        Assert.Null(method.GetCustomAttribute<HasPermissionAttribute>());
    }
}
