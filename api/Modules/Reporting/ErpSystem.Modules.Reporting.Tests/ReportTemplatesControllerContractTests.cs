using System.Reflection;
using ErpSystem.Modules.Reporting.Presentation.Features.Analytics.ReportTemplates.V1;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Commands.ChangeReportTemplateLifecycle;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Contracts;
using ErpSystem.BuildingBlocks.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Reporting.Tests;

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

        AssertPermission(nameof(ReportTemplatesController.GetPublished), ReportingPermissions.ViewReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.GetManagement), ReportingPermissions.EditReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Create), ReportingPermissions.CreateReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Update), ReportingPermissions.EditReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Publish), ReportingPermissions.PublishReportTemplates);
        AssertPermission(nameof(ReportTemplatesController.Archive), ReportingPermissions.ArchiveReportTemplates);

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

