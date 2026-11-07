using System.Linq.Expressions;
using ErpSystem.BuildingBlocks.Application.Filtering;

namespace ErpSystem.BuildingBlocks.Tests;

public sealed class ColumnFilterTests
{
    private static readonly IReadOnlyDictionary<string, ColumnFilterField> Fields = new Dictionary<string, ColumnFilterField>
    {
        ["name"] = new(ColumnFilterKind.Text),
        ["count"] = new(ColumnFilterKind.Number),
        ["date"] = new(ColumnFilterKind.Date)
    };
    private static readonly IReadOnlyDictionary<string, LambdaExpression> Selectors = new Dictionary<string, LambdaExpression>
    {
        ["name"] = (Expression<Func<Row, string?>>)(row => row.Name),
        ["count"] = (Expression<Func<Row, long?>>)(row => row.Count),
        ["date"] = (Expression<Func<Row, DateTime?>>)(row => row.Date)
    };

    [Theory]
    [InlineData("[{\"field\":\"unknown\",\"operator\":\"and\",\"constraints\":[{\"matchMode\":\"equals\",\"value\":1}]}]")]
    [InlineData("[{\"field\":\"name\",\"operator\":\"xor\",\"constraints\":[{\"matchMode\":\"contains\",\"value\":\"a\"}]}]")]
    [InlineData("[{\"field\":\"name\",\"operator\":\"and\",\"constraints\":[{\"matchMode\":\"contains\",\"value\":{\"sql\":\"unsafe\"}}]}]")]
    [InlineData("[{\"field\":\"count\",\"operator\":\"and\",\"constraints\":[{\"matchMode\":\"equals\",\"value\":1.1}]}]")]
    [InlineData("[{\"field\":\"date\",\"operator\":\"and\",\"constraints\":[{\"matchMode\":\"dateIs\",\"value\":\"2026-02-30\"}]}]")]
    [InlineData("{broken")]
    public void Invalid_untrusted_filters_are_rejected(string json) =>
        Assert.False(ColumnFilterSet.TryParse(json, Fields, out _));

    [Fact]
    public void Groups_apply_before_paging_with_and_or_and_explicit_null_semantics()
    {
        const string json = """
            [{"field":"name","operator":"or","constraints":[{"matchMode":"startsWith","value":"A"},{"matchMode":"endsWith","value":"z"}]},
             {"field":"count","operator":"and","constraints":[{"matchMode":"gte","value":3},{"matchMode":"lt","value":8}]}]
            """;
        Assert.True(ColumnFilterSet.TryParse(json, Fields, out var filters));
        var source = new[] { new Row("Ada", 1), new Row("Ada", 4), new Row("Buzz", 6), new Row("Other", 5), new Row(null, 5) }.AsQueryable();
        var query = source.Where(ColumnFilterSet.Predicate<Row>(filters, Selectors));
        Assert.Equal(2, query.Count());
        Assert.Equal("Buzz", Assert.Single(query.Skip(1).Take(1)).Name);
        Assert.Equal(5, source.Count());
    }

    [Fact]
    public void Day_filters_cover_the_entire_utc_day_and_maximum_calendar_date()
    {
        const string json = """[{"field":"date","operator":"and","constraints":[{"matchMode":"dateIs","value":"2026-11-06"}]}]""";
        Assert.True(ColumnFilterSet.TryParse(json, Fields, out var filters));
        var predicate = ColumnFilterSet.Predicate<Row>(filters, Selectors).Compile();
        Assert.True(predicate(new Row(null, null, new DateTime(2026, 11, 6, 23, 59, 59, DateTimeKind.Utc))));
        Assert.False(predicate(new Row(null, null, new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc))));
        Assert.False(predicate(new Row(null, null)));
        Assert.True(ColumnFilterSet.TryParse(json.Replace("2026-11-06", "9999-12-31", StringComparison.Ordinal), Fields, out var maximum));
        Assert.True(ColumnFilterSet.Predicate<Row>(maximum, Selectors).Compile()(new Row(null, null, DateTime.MaxValue)));
    }

    [Fact]
    public void Missing_filters_preserve_existing_queries_and_duplicate_fields_or_oversize_inputs_fail()
    {
        Assert.True(ColumnFilterSet.TryParse(null, Fields, out var empty));
        Assert.Empty(empty);
        const string group = """{"field":"name","operator":"and","constraints":[{"matchMode":"equals","value":"x"}]}""";
        Assert.False(ColumnFilterSet.TryParse("[" + group + "," + group + "]", Fields, out _));
        Assert.False(ColumnFilterSet.TryParse(new string(' ', 16 * 1024 + 1), Fields, out _));
    }

    private sealed record Row(string? Name, long? Count, DateTime? Date = null);
}
