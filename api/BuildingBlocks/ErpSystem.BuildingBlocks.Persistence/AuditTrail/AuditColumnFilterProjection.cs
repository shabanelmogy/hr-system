using System.Linq.Expressions;
using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using ErpSystem.BuildingBlocks.Application.Filtering;

namespace ErpSystem.BuildingBlocks.Persistence.AuditTrail;

internal static class AuditColumnFilterProjection
{
    private static readonly IReadOnlyDictionary<string, LambdaExpression> Selectors = new Dictionary<string, LambdaExpression>(StringComparer.Ordinal)
    {
        ["occurredOn"] = (Expression<Func<AuditTrailEntry, DateTime>>)(row => row.OccurredOnUtc),
        ["record"] = (Expression<Func<AuditTrailEntry, string>>)(row => row.EntityDisplay ?? row.EntityKey),
        ["changeCount"] = (Expression<Func<AuditTrailEntry, int>>)(row => row.ChangeCount)
    };

    public static IQueryable<AuditTrailEntry> Apply(IQueryable<AuditTrailEntry> query, AuditTrailFilter filter, string moduleCode)
    {
        var groups = filter.ColumnFilters ?? [];
        var moduleGroup = groups.Where(group => group.Field == "moduleCode").ToArray();
        if (moduleGroup.Length > 0)
        {
            var moduleSelector = new Dictionary<string, LambdaExpression>
            {
                ["moduleCode"] = (Expression<Func<string, string>>)(code => code)
            };
            if (!ColumnFilterSet.Predicate<string>(moduleGroup, moduleSelector).Compile()(moduleCode))
                return query.Where(_ => false);
        }
        if (filter.MatchingUserIds is { } ids)
            query = query.Where(entry => entry.UserId != null && ids.Contains(entry.UserId));
        foreach (var group in groups.Where(group => group.Field == "action"))
        {
            var actions = Enum.GetValues<AuditAction>().Where(action => group.Operator == "or"
                ? group.Constraints.Any(rule => rule.MatchMode == "equals" ? action.ToString() == rule.Value.GetString() : action.ToString() != rule.Value.GetString())
                : group.Constraints.All(rule => rule.MatchMode == "equals" ? action.ToString() == rule.Value.GetString() : action.ToString() != rule.Value.GetString())).ToArray();
            query = query.Where(entry => actions.Contains(entry.Action));
        }
        return query.Where(ColumnFilterSet.Predicate<AuditTrailEntry>(
            groups.Where(group => group.Field is not ("moduleCode" or "userName" or "action")).ToArray(), Selectors));
    }
}
