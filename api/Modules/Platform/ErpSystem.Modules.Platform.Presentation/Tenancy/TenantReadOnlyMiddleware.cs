using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Contracts.Tenancy;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Platform.Presentation.Tenancy;

public sealed class TenantReadOnlyMiddleware(RequestDelegate next)
{
    private const string CorrelationItemKey = "HrManagementSystem.CorrelationId";

    private static readonly HashSet<string> ReadMethods =
        new(StringComparer.OrdinalIgnoreCase)
        {
            HttpMethods.Get,
            HttpMethods.Head,
            HttpMethods.Options
        };

    public async Task InvokeAsync(
        HttpContext context,
        ICurrentExecutionContext executionContext,
        ITenantAccessService tenantAccessService,
        IStringLocalizer<TenantReadOnlyMiddleware> localizer)
    {
        if (CanContinue(context, executionContext))
        {
            await next(context);
            return;
        }

        var tenantAccess = await tenantAccessService.GetAsync(
            executionContext.TenantId!,
            context.RequestAborted);

        if (tenantAccess is null || !tenantAccess.IsReadOnly)
        {
            await next(context);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status423Locked;
        context.Response.ContentType = "application/problem+json";
        context.Response.Headers.CacheControl = "no-store";
        await context.Response.WriteAsJsonAsync(
            new ProblemDetails
            {
                Status = StatusCodes.Status423Locked,
                Title = localizer["TenantReadOnlyTitle"],
                Detail = localizer["TenantReadOnlyDetail"],
                Type = "https://httpstatuses.com/423",
                Extensions =
                {
                    ["code"] = "Tenant.SubscriptionReadOnly",
                    ["subscriptionStatus"] = tenantAccess.SubscriptionStatus,
                    ["subscriptionEndsOn"] = tenantAccess.SubscriptionEndsOn,
                    ["traceId"] = context.TraceIdentifier,
                    ["correlationId"] = GetCorrelationId(context)
                }
            },
            options: null,
            contentType: "application/problem+json",
            cancellationToken: context.RequestAborted);
    }

    private static bool CanContinue(HttpContext context, ICurrentExecutionContext executionContext) =>
        ReadMethods.Contains(context.Request.Method) ||
        context.User.Identity?.IsAuthenticated != true ||
        context.User.IsInRole(PlatformRoleNames.SuperAdmin) ||
        string.IsNullOrWhiteSpace(executionContext.TenantId) ||
        context.Request.Path.StartsWithSegments("/hubs") ||
        context.GetEndpoint()?.Metadata.GetMetadata<AllowAnonymousAttribute>() is not null ||
        context.GetEndpoint()?.Metadata.GetMetadata<AllowTenantReadOnlyAttribute>() is not null;

    private static string GetCorrelationId(HttpContext context) =>
        context.Items.TryGetValue(CorrelationItemKey, out var value) && value is string correlationId
            ? correlationId
            : context.TraceIdentifier;
}
