using System.Linq.Expressions;
using ErpSystem.BuildingBlocks.Application.Filtering;
using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;

internal static class ErrorLogFilterProjection
{
    private static readonly IReadOnlyDictionary<string, LambdaExpression> Selectors = new Dictionary<string, LambdaExpression>(StringComparer.Ordinal)
    {
        ["occurredOnUtc"] = (Expression<Func<ErrorLogEntry, DateTime>>)(row => row.OccurredOnUtc),
        ["source"] = (Expression<Func<ErrorLogEntry, string>>)(row => row.Source),
        ["severity"] = (Expression<Func<ErrorLogEntry, string>>)(row => row.Severity),
        ["service"] = (Expression<Func<ErrorLogEntry, string?>>)(row => row.Service),
        ["action"] = (Expression<Func<ErrorLogEntry, string?>>)(row => row.Action),
        ["statusCode"] = (Expression<Func<ErrorLogEntry, int?>>)(row => row.StatusCode),
        ["durationMs"] = (Expression<Func<ErrorLogEntry, long?>>)(row => row.DurationMs),
        ["client"] = (Expression<Func<ErrorLogEntry, string?>>)(row => row.Client),
        ["browser"] = (Expression<Func<ErrorLogEntry, string?>>)(row => row.Browser),
        ["summary"] = (Expression<Func<ErrorLogEntry, string>>)(row => row.Summary),
        ["ipAddress"] = (Expression<Func<ErrorLogEntry, string?>>)(row => row.IpAddress)
    };

    public static IQueryable<ErrorLogEntry> Apply(IQueryable<ErrorLogEntry> query, string? json, PlatformDbContext db)
    {
        if (!ColumnFilterSet.TryParse(json, ErrorLogColumnFilters.Fields, out var groups))
            throw new ArgumentException("Invalid error-log column filters.", nameof(json));
        query = query.Where(ColumnFilterSet.Predicate<ErrorLogEntry>(groups.Where(group => group.Field != "userName").ToArray(), Selectors));
        var userGroup = groups.Where(group => group.Field == "userName").ToArray();
        if (userGroup.Length == 0) return query;
        var userSelectors = new Dictionary<string, LambdaExpression>
        {
            ["userName"] = (Expression<Func<Identity.PlatformApplicationUser, string?>>)(user => user.UserName)
        };
        var matchingIds = db.Users.Where(ColumnFilterSet.Predicate<Identity.PlatformApplicationUser>(userGroup, userSelectors)).Select(user => user.Id);
        return query.Where(entry => entry.UserId != null && matchingIds.Contains(entry.UserId));
    }
}
