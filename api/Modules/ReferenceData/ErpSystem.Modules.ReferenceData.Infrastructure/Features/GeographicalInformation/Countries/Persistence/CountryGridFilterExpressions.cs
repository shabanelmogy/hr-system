using System.Globalization;
using System.Linq.Expressions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Countries.Persistence;

public static class CountryGridFilterExpressions
{
    public static IQueryable<Country> Apply(IQueryable<Country> query, IReadOnlyList<CountryFilterGroup>? groups)
    {
        if (!CountryGridFilters.IsValid(groups)) throw new ArgumentException("Invalid Country filter contract.", nameof(groups));
        if (groups is null || groups.Count == 0) return query;
        var country = Expression.Parameter(typeof(Country), "country");
        foreach (var group in groups)
        {
            var conditions = group.Constraints.Select(rule => Condition(country, group.Field, rule));
            var predicate = conditions.Aggregate((left, right) => group.Operator == "or" ? Expression.OrElse(left, right) : Expression.AndAlso(left, right));
            query = query.Where(Expression.Lambda<Func<Country, bool>>(predicate, country));
        }
        return query;
    }

    private static Expression Condition(ParameterExpression country, string field, CountryFilterConstraint rule)
    {
        if (field == "statesCount")
        {
            Expression<Func<Country, int>> count = row => row.States.Count(state => !state.IsDeleted);
            var value = new ReplaceParameter(count.Parameters[0], country).Visit(count.Body)!;
            return Numeric(value, rule);
        }
        var name = field switch
        {
            "id" => nameof(Country.Id), "nameAr" => nameof(Country.NameAr), "nameEn" => nameof(Country.NameEn),
            "alpha2Code" => nameof(Country.Alpha2Code), "alpha3Code" => nameof(Country.Alpha3Code),
            "phoneCode" => nameof(Country.PhoneCode), "currencyCode" => nameof(Country.CurrencyCode),
            "createdOn" => nameof(Country.CreatedOn), "updatedOn" => nameof(Country.UpdatedOn),
            "isDeleted" => nameof(Country.IsDeleted), _ => throw new ArgumentException("Unsupported Country filter field.", nameof(field))
        };
        var property = Expression.Property(country, name);
        if (field == "id") return Numeric(property, rule);
        if (field == "isDeleted") return rule.MatchMode == "equals"
            ? Expression.Equal(property, Expression.Constant(rule.Value.GetBoolean()))
            : Expression.NotEqual(property, Expression.Constant(rule.Value.GetBoolean()));
        if (field is "createdOn" or "updatedOn") return Date(property, rule);
        var operation = rule.MatchMode switch { "notContains" => "DOESNOTCONTAIN", "notEquals" => "DOESNOTEQUAL", _ => rule.MatchMode.ToUpperInvariant() };
        return CountryReadStore.CreateSearchCondition(property, operation, rule.Value.GetString()!.Trim().ToUpperInvariant());
    }

    private static BinaryExpression Numeric(Expression value, CountryFilterConstraint rule)
    {
        var target = Expression.Constant(rule.Value.GetInt32());
        return rule.MatchMode switch
        {
            "equals" => Expression.Equal(value, target), "notEquals" => Expression.NotEqual(value, target),
            "lt" => Expression.LessThan(value, target), "lte" => Expression.LessThanOrEqual(value, target),
            "gt" => Expression.GreaterThan(value, target), "gte" => Expression.GreaterThanOrEqual(value, target),
            _ => throw new ArgumentException("Unsupported numeric mode.", nameof(rule))
        };
    }

    private static BinaryExpression Date(Expression property, CountryFilterConstraint rule)
    {
        var date = DateOnly.ParseExact(rule.Value.GetString()!, "yyyy-MM-dd", CultureInfo.InvariantCulture);
        var start = Expression.Constant(date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
        var nullable = property.Type == typeof(DateTime?);
        Expression hasValue = nullable ? Expression.Property(property, "HasValue") : Expression.Constant(true);
        Expression value = nullable ? Expression.Property(property, "Value") : property;
        var from = Expression.GreaterThanOrEqual(value, start);
        Expression after = date == DateOnly.MaxValue ? Expression.Constant(false) :
            Expression.GreaterThanOrEqual(value, Expression.Constant(date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc)));
        var matches = Expression.AndAlso(from, Expression.Not(after));
        return rule.MatchMode switch
        {
            "dateIs" => Expression.AndAlso(hasValue, matches),
            "dateIsNot" => Expression.OrElse(Expression.Not(hasValue), Expression.Not(matches)),
            "dateBefore" => Expression.AndAlso(hasValue, Expression.LessThan(value, start)),
            "dateAfter" => Expression.AndAlso(hasValue, after),
            _ => throw new ArgumentException("Unsupported date mode.", nameof(rule))
        };
    }

    private sealed class ReplaceParameter(ParameterExpression source, ParameterExpression target) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) => node == source ? target : base.VisitParameter(node);
    }
}
