using System.Globalization;
using System.Linq.Expressions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public static class GlobalCrystalReportFilterExpressions
{
    public static IQueryable<GlobalCrystalReport> Apply(IQueryable<GlobalCrystalReport> query,
        IReadOnlyList<GlobalCrystalReportFilterGroup>? groups)
    {
        if (!GlobalCrystalReportFilters.IsValid(groups)) throw new ArgumentException("Invalid global report filters.", nameof(groups));
        if (groups is null) return query;
        foreach (var group in groups)
        {
            var row = Expression.Parameter(typeof(GlobalCrystalReport), "report");
            var conditions = group.Constraints.Select(rule => Condition(row, group.Field, rule));
            var body = conditions.Aggregate((left, right) => group.Operator == "or"
                ? Expression.OrElse(left, right) : Expression.AndAlso(left, right));
            query = query.Where(Expression.Lambda<Func<GlobalCrystalReport, bool>>(body, row));
        }
        return query;
    }

    private static Expression Condition(ParameterExpression row, string field, GlobalCrystalReportFilterRule rule)
    {
        if (field == "currentVersionNumber")
        {
            Expression<Func<GlobalCrystalReport, int?>> version = report => report.Versions
                .Where(item => item.Id == report.CurrentPublishedVersionId)
                .Select(item => (int?)item.VersionNumber).FirstOrDefault();
            var value = new ReplaceParameter(version.Parameters[0], row).Visit(version.Body)!;
            var target = Expression.Convert(Expression.Constant(rule.Value.GetInt32()), typeof(int?));
            var compare = rule.MatchMode switch
            {
                "equals" => Expression.Equal(value, target), "notEquals" => Expression.NotEqual(value, target),
                "lt" => Expression.LessThan(value, target), "lte" => Expression.LessThanOrEqual(value, target),
                "gt" => Expression.GreaterThan(value, target), "gte" => Expression.GreaterThanOrEqual(value, target),
                _ => throw new ArgumentException("Invalid version mode.", nameof(rule))
            };
            return Expression.AndAlso(Expression.NotEqual(value, Expression.Constant(null, typeof(int?))), compare);
        }
        if (field == "updatedOn") return Date(Expression.Property(row, nameof(GlobalCrystalReport.UpdatedOn)), rule);
        Expression text = field switch
        {
            "displayName" => Expression.Property(row, nameof(GlobalCrystalReport.DisplayName)),
            "reportKey" => Expression.Property(row, nameof(GlobalCrystalReport.ReportKey)),
            "entityKey" => Expression.Property(row, nameof(GlobalCrystalReport.EntityKey)),
            "status" => Expression.Condition(Expression.Property(row, nameof(GlobalCrystalReport.IsDeleted)), Expression.Constant("archived"),
                Expression.Condition(Expression.NotEqual(Expression.Property(row, nameof(GlobalCrystalReport.CurrentPublishedVersionId)),
                    Expression.Constant(null, typeof(Guid?))), Expression.Constant("published"), Expression.Constant("draft"))),
            _ => throw new ArgumentException("Unknown report field.", nameof(field))
        };
        var upper = Expression.Call(text, nameof(string.ToUpper), Type.EmptyTypes);
        var term = Expression.Constant(rule.Value.GetString()!.Trim().ToUpperInvariant());
        Expression match = rule.MatchMode switch
        {
            "equals" or "notEquals" => Expression.Equal(upper, term),
            "contains" or "notContains" => Expression.Call(upper, nameof(string.Contains), Type.EmptyTypes, term),
            "startsWith" => Expression.Call(upper, nameof(string.StartsWith), Type.EmptyTypes, term),
            "endsWith" => Expression.Call(upper, nameof(string.EndsWith), Type.EmptyTypes, term),
            _ => throw new ArgumentException("Invalid text mode.", nameof(rule))
        };
        if (rule.MatchMode is "notContains" or "notEquals") match = Expression.Not(match);
        return match;
    }

    private static BinaryExpression Date(Expression property, GlobalCrystalReportFilterRule rule)
    {
        var day = DateOnly.ParseExact(rule.Value.GetString()!, "yyyy-MM-dd", CultureInfo.InvariantCulture);
        var start = Expression.Constant(day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
        var value = Expression.Property(property, "Value");
        var hasValue = Expression.Property(property, "HasValue");
        Expression after = day == DateOnly.MaxValue ? Expression.Constant(false)
            : Expression.GreaterThanOrEqual(value, Expression.Constant(day.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc)));
        var matches = Expression.AndAlso(Expression.GreaterThanOrEqual(value, start), Expression.Not(after));
        return rule.MatchMode switch
        {
            "dateIs" => Expression.AndAlso(hasValue, matches),
            "dateIsNot" => Expression.OrElse(Expression.Not(hasValue), Expression.Not(matches)),
            "dateBefore" => Expression.AndAlso(hasValue, Expression.LessThan(value, start)),
            "dateAfter" => Expression.AndAlso(hasValue, after),
            _ => throw new ArgumentException("Invalid date mode.", nameof(rule))
        };
    }

    private sealed class ReplaceParameter(ParameterExpression source, ParameterExpression target) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) => node == source ? target : base.VisitParameter(node);
    }
}
