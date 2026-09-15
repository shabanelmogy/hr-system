using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits.Contracts;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.SecurityAudits;

public sealed record SecurityAuditReadScope(
    bool IsPlatformAdministrator,
    string? TenantId,
    int? CompanyId);

public interface ISecurityAuditReadStore
{
    Task<SecurityAuditPageResponse> GetAsync(
        SecurityAuditQueryRequest request,
        SecurityAuditReadScope scope,
        CancellationToken cancellationToken = default);
}

public sealed record GetSecurityAuditsQuery(SecurityAuditQueryRequest Request)
    : IQuery<Result<SecurityAuditPageResponse>>;

public sealed class GetSecurityAuditsQueryHandler(
    ISecurityAuditReadStore store,
    ICurrentExecutionContext executionContext)
    : IQueryHandler<GetSecurityAuditsQuery, Result<SecurityAuditPageResponse>>
{
    private static readonly Error MissingTenant = new(
        "SecurityAudit.MissingTenant",
        "A tenant context is required.",
        ErrorType.Forbidden);
    private static readonly Error MissingCompany = new(
        "SecurityAudit.MissingCompany",
        "A company context is required.",
        ErrorType.Forbidden);

    public async Task<Result<SecurityAuditPageResponse>> Handle(
        GetSecurityAuditsQuery request,
        CancellationToken cancellationToken)
    {
        var isPlatformAdministrator = executionContext.IsInRole(PlatformRoleNames.SuperAdmin);
        var tenantId = isPlatformAdministrator
            ? request.Request.TenantId
            : executionContext.TenantId;

        if (!isPlatformAdministrator && string.IsNullOrWhiteSpace(tenantId))
            return Result.Failure<SecurityAuditPageResponse>(MissingTenant);
        if (!isPlatformAdministrator && executionContext.CompanyId is null or <= 0)
            return Result.Failure<SecurityAuditPageResponse>(MissingCompany);

        var result = await store.GetAsync(
            request.Request,
            new SecurityAuditReadScope(
                isPlatformAdministrator,
                tenantId,
                executionContext.CompanyId),
            cancellationToken).ConfigureAwait(false);

        return Result.Success(result);
    }
}
