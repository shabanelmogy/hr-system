using System.Text.Json;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Domain.Platform.SecurityAudits.Entities;

namespace HrManagementSystem.Infrastructure.Features.Platform.SecurityAudits.Services;

public sealed class SecurityAuditQueryService(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    IHttpContextAccessor httpContextAccessor) : ISecurityAuditQueryService
{
    private static readonly Error MissingTenant = new(
        "SecurityAudit.MissingTenant",
        "A tenant context is required.",
        ErrorType.Forbidden);

    public async Task<Result<SecurityAuditPageResponse>> GetAsync(
        SecurityAuditQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var isPlatformAdministrator = httpContextAccessor.HttpContext?.User
            .IsInRole(AppRoles.super_admin) == true;
        var tenantId = isPlatformAdministrator ? request.TenantId : currentActor.TenantId;

        if (!isPlatformAdministrator && string.IsNullOrWhiteSpace(tenantId))
            return Result.Failure<SecurityAuditPageResponse>(MissingTenant);

        IQueryable<SecurityAuditEvent> query = context.SecurityAuditEvents.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(tenantId))
            query = query.Where(audit => audit.TenantId == tenantId);

        if (!isPlatformAdministrator && currentActor.CompanyId.HasValue)
        {
            var companyId = currentActor.CompanyId.Value;
            query = query.Where(audit => audit.CompanyId == null || audit.CompanyId == companyId);
        }
        else if (request.CompanyId.HasValue)
        {
            query = query.Where(audit => audit.CompanyId == request.CompanyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.ActorUserId))
            query = query.Where(audit => audit.ActorUserId == request.ActorUserId);
        if (!string.IsNullOrWhiteSpace(request.Action))
            query = query.Where(audit => audit.Action.Contains(request.Action));
        if (!string.IsNullOrWhiteSpace(request.TargetType))
            query = query.Where(audit => audit.TargetType == request.TargetType);
        if (request.Outcome.HasValue)
            query = query.Where(audit => audit.Outcome == request.Outcome.Value);
        if (request.FromUtc.HasValue)
            query = query.Where(audit => audit.OccurredOn >= request.FromUtc.Value);
        if (request.ToUtc.HasValue)
            query = query.Where(audit => audit.OccurredOn <= request.ToUtc.Value);

        query = ApplyOrdering(query, request.ColumnName, request.SortDirection);
        var count = await query.CountAsync(cancellationToken);
        var rows = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);
        var page = new PagedList<SecurityAuditEvent>(
            rows,
            count,
            request.PageNumber,
            request.PageSize);

        return Result.Success(new SecurityAuditPageResponse(
            page.Select(ToResponse).ToArray(),
            page.MetaData));
    }

    private static SecurityAuditResponse ToResponse(SecurityAuditEvent audit) => new(
        audit.Id,
        audit.TenantId,
        audit.CompanyId,
        audit.ActorUserId,
        audit.Action,
        audit.TargetType,
        audit.TargetId,
        audit.Outcome,
        audit.Reason,
        audit.IpAddress,
        audit.UserAgent,
        audit.CorrelationId,
        ParseMetadata(audit.MetadataJson),
        audit.OccurredOn);

    private static IReadOnlyDictionary<string, string?> ParseMetadata(string? metadataJson)
    {
        if (string.IsNullOrWhiteSpace(metadataJson))
            return new Dictionary<string, string?>();

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string?>>(metadataJson)
                ?? new Dictionary<string, string?>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, string?>();
        }
    }

    private static IQueryable<SecurityAuditEvent> ApplyOrdering(
        IQueryable<SecurityAuditEvent> query,
        string? columnName,
        string? sortDirection)
    {
        var descending = !string.Equals(sortDirection, "ASC", StringComparison.OrdinalIgnoreCase);

        return (columnName?.ToUpperInvariant(), descending) switch
        {
            ("ACTION", false) => query.OrderBy(audit => audit.Action).ThenBy(audit => audit.Id),
            ("ACTION", true) => query.OrderByDescending(audit => audit.Action).ThenByDescending(audit => audit.Id),
            ("OUTCOME", false) => query.OrderBy(audit => audit.Outcome).ThenBy(audit => audit.Id),
            ("OUTCOME", true) => query.OrderByDescending(audit => audit.Outcome).ThenByDescending(audit => audit.Id),
            ("OCCURREDON", false) => query.OrderBy(audit => audit.OccurredOn).ThenBy(audit => audit.Id),
            _ => query.OrderByDescending(audit => audit.OccurredOn).ThenByDescending(audit => audit.Id)
        };
    }
}
