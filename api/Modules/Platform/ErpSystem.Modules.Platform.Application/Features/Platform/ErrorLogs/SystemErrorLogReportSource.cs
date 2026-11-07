using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;

public interface IErrorLogReportReadStore
{
    /// <summary>Null signals overflow; no partial report may be returned.</summary>
    Task<IReadOnlyList<SystemErrorLogReportRow>?> ReadReportAsync(ErrorLogCriteria criteria, CancellationToken token);
}

public sealed class SystemErrorLogReportSource(IErrorLogReportReadStore store, ICurrentExecutionContext actor)
    : ISystemErrorLogReportSource
{
    public async Task<SystemErrorLogReportResult> ReadAsync(SystemErrorLogReportCriteria criteria, CancellationToken token)
    {
        ArgumentNullException.ThrowIfNull(criteria);
        if (string.IsNullOrWhiteSpace(actor.UserId) || !actor.IsInRole(PlatformRoleNames.SuperAdmin))
            return new([], SystemErrorLogReportFailure.Forbidden);

        var query = new ErrorLogCriteria(criteria.FromUtc, criteria.ToUtc, criteria.UserName,
            criteria.Source, criteria.StatusCode, criteria.Search, ColumnFilters: criteria.ColumnFilters);
        if (!ErrorLogCriteriaPolicy.IsValid(query) || !ErrorLogColumnFilters.IsValid(query.ColumnFilters, true))
            return new([], SystemErrorLogReportFailure.Invalid);

        var rows = await store.ReadReportAsync(query, token);
        return rows is null
            ? new([], SystemErrorLogReportFailure.TooLarge)
            : new(rows, SystemErrorLogReportFailure.None);
    }
}
