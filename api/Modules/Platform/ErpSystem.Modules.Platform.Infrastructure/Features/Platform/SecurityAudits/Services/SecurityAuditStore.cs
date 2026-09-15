using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Application.SecurityAudits;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.SecurityAudits.Services;

public sealed class SecurityAuditStore(PlatformDbContext context) : ISecurityAuditStore
{
    public void Add(SecurityAuditRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);

        context.SecurityAuditEvents.Add(new SecurityAuditEvent(
            record.Id,
            record.Action,
            record.TargetType,
            (ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Enums.SecurityAuditOutcome)(int)record.Outcome,
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
