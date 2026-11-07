using System.Globalization;
using System.Linq.Expressions;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ErpSystem.BuildingBlocks.Application.Filtering;

public enum ColumnFilterKind { Text, Number, Date }
public sealed record ColumnFilterField(ColumnFilterKind Kind, IReadOnlySet<string>? Choices = null);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record ColumnFilterRule(string MatchMode, JsonElement Value);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record ColumnFilterGroup(string Field, string Operator, IReadOnlyList<ColumnFilterRule> Constraints);

/// <summary>Bounded, allowlisted scalar filters shared by read owners; never interprets SQL or property paths.</summary>
public static class ColumnFilterSet
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = false,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
        MaxDepth = 8
    };

    public static bool TryParse(string? json, IReadOnlyDictionary<string, ColumnFilterField> fields,
        out IReadOnlyList<ColumnFilterGroup> groups)
    {
        groups = [];
        if (json is null) return true;
        if (json.Length > 16384 || Encoding.UTF8.GetByteCount(json) > 16384) return false;
        try
        {
            var parsed = JsonSerializer.Deserialize<List<ColumnFilterGroup>>(json, JsonOptions);
            if (parsed is null || parsed.Count > 14) return false;
            var seen = new HashSet<string>(StringComparer.Ordinal);
            foreach (var group in parsed)
            {
                if (group is null || group.Field is null || !seen.Add(group.Field) ||
                    !fields.TryGetValue(group.Field, out var field) || group.Operator is not ("and" or "or") ||
                    group.Constraints is not { Count: >= 1 and <= 4 }) return false;
                foreach (var rule in group.Constraints)
                    if (rule is null || !ValidRule(rule, field)) return false;
            }
            groups = parsed;
            return true;
        }
        catch (JsonException) { return false; }
    }

    private static bool ValidRule(ColumnFilterRule rule, ColumnFilterField field) => field.Kind switch
    {
        ColumnFilterKind.Text => rule.MatchMode is "contains" or "notContains" or "startsWith" or "endsWith" or "equals" or "notEquals" &&
            rule.Value.ValueKind == JsonValueKind.String && rule.Value.GetString() is { Length: > 0 and <= 200 } text &&
            !string.IsNullOrWhiteSpace(text) && (field.Choices is null ||
                (rule.MatchMode is "equals" or "notEquals" && field.Choices.Contains(text))),
        ColumnFilterKind.Number => rule.MatchMode is "equals" or "notEquals" or "lt" or "lte" or "gt" or "gte" &&
            rule.Value.ValueKind == JsonValueKind.Number && rule.Value.TryGetInt64(out var number) &&
            number is >= -9007199254740991 and <= 9007199254740991,
        ColumnFilterKind.Date => rule.MatchMode is "dateIs" or "dateIsNot" or "dateBefore" or "dateAfter" &&
            rule.Value.ValueKind == JsonValueKind.String && DateOnly.TryParseExact(rule.Value.GetString(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _),
        _ => false
    };

    public static Expression<Func<T, bool>> Predicate<T>(IReadOnlyList<ColumnFilterGroup> groups,
        IReadOnlyDictionary<string, LambdaExpression> selectors)
    {
        var parameter = Expression.Parameter(typeof(T), "row");
        Expression body = Expression.Constant(true);
        foreach (var group in groups)
        {
            if (!selectors.TryGetValue(group.Field, out var selector))
                throw new ArgumentException("A validated filter needs an explicit owner selector.", nameof(groups));
            var value = new ReplaceParameter(selector.Parameters[0], parameter).Visit(selector.Body);
            Expression? rules = null;
            foreach (var rule in group.Constraints)
            {
                var next = Rule(value, rule);
                rules = rules is null ? next : group.Operator == "or" ? Expression.OrElse(rules, next) : Expression.AndAlso(rules, next);
            }
            body = Expression.AndAlso(body, rules ?? Expression.Constant(false));
        }
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }

    private static Expression Rule(Expression value, ColumnFilterRule rule)
    {
        if (value.Type == typeof(string))
        {
            value = Expression.Coalesce(value, Expression.Constant(""));
            var expected = Expression.Constant(rule.Value.GetString()!);
            return rule.MatchMode switch
            {
                "equals" => Expression.Equal(value, expected),
                "notEquals" => Expression.NotEqual(value, expected),
                "contains" => Expression.Call(value, nameof(string.Contains), Type.EmptyTypes, expected),
                "notContains" => Expression.Not(Expression.Call(value, nameof(string.Contains), Type.EmptyTypes, expected)),
                "startsWith" => Expression.Call(value, nameof(string.StartsWith), Type.EmptyTypes, expected),
                "endsWith" => Expression.Call(value, nameof(string.EndsWith), Type.EmptyTypes, expected),
                _ => throw new ArgumentException("Unsupported validated text rule.", nameof(rule))
            };
        }
        var nullable = Nullable.GetUnderlyingType(value.Type);
        var scalar = nullable is null ? value : Expression.Property(value, "Value");
        Expression comparison;
        if (scalar.Type == typeof(DateTime))
        {
            var day = DateOnly.ParseExact(rule.Value.GetString()!, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            var start = DateTime.SpecifyKind(day.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var end = day == DateOnly.MaxValue ? DateTime.MaxValue : start.AddDays(1);
            var afterStart = Expression.GreaterThanOrEqual(scalar, Expression.Constant(start));
            var beforeEnd = day == DateOnly.MaxValue
                ? Expression.LessThanOrEqual(scalar, Expression.Constant(end))
                : Expression.LessThan(scalar, Expression.Constant(end));
            comparison = rule.MatchMode switch
            {
                "dateIs" => Expression.AndAlso(afterStart, beforeEnd),
                "dateIsNot" => Expression.Not(Expression.AndAlso(afterStart, beforeEnd)),
                "dateBefore" => Expression.LessThan(scalar, Expression.Constant(start)),
                "dateAfter" => day == DateOnly.MaxValue ? Expression.Constant(false) : Expression.GreaterThanOrEqual(scalar, Expression.Constant(end)),
                _ => throw new ArgumentException("Unsupported validated date rule.", nameof(rule))
            };
        }
        else
        {
            var number = Expression.Convert(scalar, typeof(long));
            var expected = Expression.Constant(rule.Value.GetInt64());
            comparison = rule.MatchMode switch
            {
                "equals" => Expression.Equal(number, expected),
                "notEquals" => Expression.NotEqual(number, expected),
                "lt" => Expression.LessThan(number, expected),
                "lte" => Expression.LessThanOrEqual(number, expected),
                "gt" => Expression.GreaterThan(number, expected),
                "gte" => Expression.GreaterThanOrEqual(number, expected),
                _ => throw new ArgumentException("Unsupported validated numeric rule.", nameof(rule))
            };
        }
        return nullable is null ? comparison : Expression.AndAlso(Expression.Property(value, "HasValue"), comparison);
    }

    private sealed class ReplaceParameter(ParameterExpression source, ParameterExpression target) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) => node == source ? target : base.VisitParameter(node);
    }
}
