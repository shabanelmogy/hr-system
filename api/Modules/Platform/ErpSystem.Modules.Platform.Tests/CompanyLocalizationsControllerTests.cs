using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Presentation.Features.Platform.CompanyLocalization.V1;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyLocalizationsControllerTests
{
    [Fact]
    public void Controller_has_sender_only_current_company_contract_and_exact_permissions()
    {
        Assert.Equal([typeof(MediatR.ISender)], Assert.Single(typeof(CompanyLocalizationsController).GetConstructors()).GetParameters().Select(parameter => parameter.ParameterType));
        var route = Assert.IsType<RouteAttribute>(typeof(CompanyLocalizationsController).GetCustomAttribute<RouteAttribute>());
        Assert.Equal("api/v{version:apiVersion}/company-localizations", route.Template);
        Assert.NotNull(typeof(CompanyLocalizationsController).GetCustomAttribute<TenantMemberAttribute>());
        AssertPermission(nameof(CompanyLocalizationsController.GetSettings), PlatformPermissions.ViewCompanyLocalizations);
        AssertPermission(nameof(CompanyLocalizationsController.GetTexts), PlatformPermissions.ViewCompanyLocalizations);
        Assert.Null(typeof(CompanyLocalizationsController).GetMethod(nameof(CompanyLocalizationsController.GetRuntime))!.GetCustomAttribute<HasPermissionAttribute>());
        AssertPermission(nameof(CompanyLocalizationsController.SetDefault), PlatformPermissions.SetCompanyLocalizationDefault);
        AssertPermission(nameof(CompanyLocalizationsController.SetText), PlatformPermissions.EditCompanyLocalizations);
        AssertPermission(nameof(CompanyLocalizationsController.ResetText), PlatformPermissions.ResetCompanyLocalizations);
    }
    [Fact]
    public void Company_localization_permissions_are_tenant_administration_only()
    {
        Assert.Contains(PlatformPermissions.ViewCompanyLocalizations, PlatformPermissions.TenantAdministration);
        Assert.Contains(PlatformPermissions.EditCompanyLocalizations, PlatformPermissions.TenantAdministration);
        Assert.Contains(PlatformPermissions.ResetCompanyLocalizations, PlatformPermissions.TenantAdministration);
        Assert.Contains(PlatformPermissions.SetCompanyLocalizationDefault, PlatformPermissions.TenantAdministration);
    }
    private static void AssertPermission(string method, string permission) =>
        Assert.Equal(permission, Assert.Single(typeof(CompanyLocalizationsController).GetMethod(method)!
            .GetCustomAttributes<HasPermissionAttribute>()).Policy);
}

