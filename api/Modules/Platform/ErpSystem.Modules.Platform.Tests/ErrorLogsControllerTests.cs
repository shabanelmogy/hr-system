using System.Reflection;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using ErpSystem.Modules.Platform.Presentation.Features.Platform.ErrorLogs.V1;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class ErrorLogsControllerTests
{
    [Fact]
    public void Company_and_system_routes_have_distinct_authority_and_exact_action_permissions()
    {
        Assert.NotNull(typeof(ErrorLogsController).GetCustomAttribute<TenantMemberAttribute>());
        Assert.Equal(PlatformRoleNames.SuperAdmin, typeof(SystemErrorLogsController).GetCustomAttribute<AuthorizeAttribute>()!.Roles);
        Assert.Null(typeof(SystemErrorLogsController).GetCustomAttribute<TenantMemberAttribute>());
        Check<ErrorLogsController>(nameof(ErrorLogsController.List), PlatformPermissions.ViewErrorLogs);
        Check<ErrorLogsController>(nameof(ErrorLogsController.Detail), PlatformPermissions.ViewErrorLogDetails);
        Check<ErrorLogsController>(nameof(ErrorLogsController.Export), PlatformPermissions.ExportErrorLogs);
        Check<SystemErrorLogsController>(nameof(SystemErrorLogsController.List), PlatformPermissions.ViewSystemErrorLogs);
        Check<SystemErrorLogsController>(nameof(SystemErrorLogsController.Detail), PlatformPermissions.ViewSystemErrorLogDetails);
        Check<SystemErrorLogsController>(nameof(SystemErrorLogsController.Export), PlatformPermissions.ExportSystemErrorLogs);
        Check<SystemErrorLogsController>(nameof(SystemErrorLogsController.Settings), PlatformPermissions.ViewErrorLogSettings);
        Check<SystemErrorLogsController>(nameof(SystemErrorLogsController.UpdateSettings), PlatformPermissions.EditErrorLogSettings);
        Assert.Equal("api/v{version:apiVersion}/error-logs", typeof(ErrorLogsController).GetCustomAttribute<RouteAttribute>()!.Template);
        Assert.Equal("api/v{version:apiVersion}/system-error-logs", typeof(SystemErrorLogsController).GetCustomAttribute<RouteAttribute>()!.Template);
    }

    [Fact]
    public void Ingress_is_authenticated_rate_limited_read_only_safe_and_rejects_payload_or_scope_fields()
    {
        Assert.NotNull(typeof(ClientErrorLogsController).GetCustomAttribute<AuthorizeAttribute>());
        Assert.NotNull(typeof(ClientErrorLogsController).GetCustomAttribute<AllowTenantReadOnlyAttribute>());
        Assert.Null(typeof(ClientErrorLogsController).GetCustomAttribute<TenantMemberAttribute>());
        var report = typeof(ClientErrorLogsController).GetMethod(nameof(ClientErrorLogsController.Report))!;
        Assert.Equal("errorLogClient", report.GetCustomAttribute<EnableRateLimitingAttribute>()!.PolicyName);
        Assert.NotNull(report.GetCustomAttribute<RequestSizeLimitAttribute>());
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<ClientErrorLogReport>(
            "{\"source\":\"web\",\"kind\":\"runtime\",\"errorType\":\"Error\",\"eventId\":\"39b74ec1-d480-4566-b8a9-a07d637abf8a\",\"tenantId\":\"foreign\",\"message\":\"private\"}", options));
    }

    [Fact]
    public void Company_permissions_are_not_global_and_system_permissions_are_not_tenant_grants()
    {
        foreach (var permission in new[] { PlatformPermissions.ViewErrorLogs, PlatformPermissions.ViewErrorLogDetails, PlatformPermissions.ExportErrorLogs })
        {
            Assert.Contains(permission, PlatformPermissions.TenantAdministration);
            Assert.DoesNotContain(permission, PlatformPermissions.GlobalOperations);
        }
        foreach (var permission in new[] { PlatformPermissions.ViewSystemErrorLogs, PlatformPermissions.ViewSystemErrorLogDetails,
                     PlatformPermissions.ExportSystemErrorLogs, PlatformPermissions.ViewErrorLogSettings, PlatformPermissions.EditErrorLogSettings })
        {
            Assert.Contains(permission, PlatformPermissions.GlobalOperations);
            Assert.DoesNotContain(permission, PlatformPermissions.TenantAdministration);
        }
    }

    private static void Check<T>(string method, string permission)
    {
        Assert.Equal([typeof(MediatR.ISender)], Assert.Single(typeof(T).GetConstructors()).GetParameters().Select(parameter => parameter.ParameterType));
        Assert.Equal(permission, Assert.Single(typeof(T).GetMethod(method)!.GetCustomAttributes<HasPermissionAttribute>()).Policy);
    }
}
