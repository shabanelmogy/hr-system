using System.Reflection;
using HrManagementSystem.Api.Features.Analytics.ReportTemplates.V1;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Commands.ChangeReportTemplateLifecycle;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Tests;

public sealed class ReportTemplatesControllerContractTests
{
    [Fact]
    public void Controller_IsThinTenantApiWithPermissionSeparatedCatalogAndManagement()
    {
        var constructor = Assert.Single(typeof(ReportTemplatesController).GetConstructors());
        Assert.Equal(typeof(ISender), Assert.Single(constructor.GetParameters()).ParameterType);
        Assert.Equal(
            "api/v{version:apiVersion}/report-templates",
            typeof(ReportTemplatesController).GetCustomAttribute<RouteAttribute>()?.Template);

        AssertPermission(nameof(ReportTemplatesController.GetPublished), Permissions.ViewReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.GetManagement), Permissions.EditReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Create), Permissions.CreateReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Update), Permissions.EditReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Publish), Permissions.PublishReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Archive), Permissions.DeleteReportTemplates);

        Assert.Equal(
            typeof(CreateReportTemplateRequest),
            typeof(ReportTemplatesController).GetMethod(nameof(ReportTemplatesController.Create))!
                .GetParameters()[0].ParameterType);
    }

    [Fact]
    public void LifecycleCommands_RequireValidConcurrencyTokens()
    {
        var valid = Convert.ToBase64String([1, 2, 3]);
        Assert.True(new PublishReportTemplateCommandValidator()
            .Validate(new PublishReportTemplateCommand(Guid.NewGuid(), valid)).IsValid);
        Assert.False(new PublishReportTemplateCommandValidator()
            .Validate(new PublishReportTemplateCommand(Guid.NewGuid(), "invalid")).IsValid);
        Assert.False(new ArchiveReportTemplateCommandValidator()
            .Validate(new ArchiveReportTemplateCommand(Guid.NewGuid(), string.Empty)).IsValid);
    }

    private static void AssertPermission(string action, string permission) =>
        Assert.Equal(
            permission,
            typeof(ReportTemplatesController).GetMethod(action)!
                .GetCustomAttribute<HasPermissionAttribute>()?.Policy);
}
