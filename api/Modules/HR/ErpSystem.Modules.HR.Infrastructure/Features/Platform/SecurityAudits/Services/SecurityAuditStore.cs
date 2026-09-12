using ErpSystem.Modules.HR.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.SecurityAudits.Services;

public sealed class SecurityAuditStore(ApplicationDbContext context) : ISecurityAuditStore
{
    public void Add(SecurityAuditRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);

        context.SecurityAuditEvents.Add(new SecurityAuditEvent(
            record.Id,
            record.Action,
            record.TargetType,
            (ErpSystem.Modules.HR.Domain.Platform.SecurityAudits.Enums.SecurityAuditOutcome)(int)record.Outcome,
            record.OccurredOn,
            record.TenantId,
            record.CompanyId,
            record.ActorUserId,
            record.TargetId,
            record.Reason,
            record.IpAddress,
            record.UserAgent,
            record.CorrelationId,
            record.MetadataJson));
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}
