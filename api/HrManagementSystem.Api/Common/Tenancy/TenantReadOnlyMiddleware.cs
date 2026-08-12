using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.Tenancy.Services;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Api.Common.Tenancy;

public sealed class TenantReadOnlyMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> ReadMethods =
        new(StringComparer.OrdinalIgnoreCase)
        {
            HttpMethods.Get,
            HttpMethods.Head,
            HttpMethods.Options
        };

    public async Task InvokeAsync(
        HttpContext context,
        ICurrentActor currentActor,
        ITenantAccessService tenantAccessService,
        IStringLocalizer<TenantReadOnlyMiddleware> localizer)
    {
        if (CanContinue(context, currentActor))
        {
            await next(context);
            return;
        }

        var tenantAccess = await tenantAccessService.GetAsync(
            currentActor.TenantId!,
            context.RequestAborted);

        if (tenantAccess is null || !tenantAccess.IsReadOnly)
        {
            await next(context);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status423Locked;
        context.Response.ContentType = "application/problem+json";
        context.Response.Headers["Cache-Control"] = "no-store";
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
                    ["correlationId"] = context.GetCorrelationId()
                }
            },
            context.RequestAborted);
    }

    private static bool CanContinue(HttpContext context, ICurrentActor currentActor) =>
        ReadMethods.Contains(context.Request.Method) ||
        context.User.Identity?.IsAuthenticated != true ||
        context.User.IsInRole(AppRoles.super_admin) ||
        string.IsNullOrWhiteSpace(currentActor.TenantId) ||
        context.Request.Path.StartsWithSegments("/hubs") ||
        context.GetEndpoint()?.Metadata.GetMetadata<AllowAnonymousAttribute>() is not null ||
        context.GetEndpoint()?.Metadata.GetMetadata<AllowTenantReadOnlyAttribute>() is not null;
}
