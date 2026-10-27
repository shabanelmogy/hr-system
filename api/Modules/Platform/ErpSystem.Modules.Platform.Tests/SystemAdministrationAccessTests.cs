using System.Reflection;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Presentation.Features.Platform.AuditTrail.V1;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class SystemAdministrationAccessTests
{
    [Fact]
    public void Global_audit_has_separate_role_permission_and_endpoint_from_company_audit()
    {
        var system = typeof(SystemAuditTrailController);
        Assert.Contains(system.GetCustomAttributes<AuthorizeAttribute>(), attribute => attribute.Roles == "super_admin");
        Assert.Equal("api/v{version:apiVersion}/system-audit-trail", system.GetCustomAttribute<RouteAttribute>()?.Template);
        Assert.Equal([typeof(MediatR.ISender)], Assert.Single(system.GetConstructors()).GetParameters().Select(p => p.ParameterType));
        Assert.NotNull(system.GetCustomAttribute<HasPermissionAttribute>());
        Assert.Contains(PlatformPermissions.ViewSystemAuditTrail, PlatformPermissions.GlobalOperations);
        Assert.Contains(PlatformPermissions.ViewSystemHealth, PlatformPermissions.GlobalOperations);
        Assert.Contains(PlatformPermissions.ViewSystemApiDocs, PlatformPermissions.GlobalOperations);
        Assert.DoesNotContain(PlatformPermissions.ViewAuditTrail, PlatformPermissions.GlobalOperations);
        Assert.Contains(PlatformPermissions.ViewAuditTrail, PlatformPermissions.TenantAdministration);
    }
}
