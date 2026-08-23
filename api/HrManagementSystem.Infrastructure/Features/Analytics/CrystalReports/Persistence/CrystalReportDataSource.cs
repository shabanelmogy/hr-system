using System.Data;
using System.Globalization;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;

namespace HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class CrystalReportDataSource(ApplicationDbContext context)
    : ICrystalReportDataSource
{
    private static readonly string[] NameFilters =
        ["NameAr", "NameEn", "CountryAr", "CountryEn", "StateAr", "StateEn"];

    public async Task<CrystalReportDataSet?> BuildAsync(
        string entityKey,
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        if (filters.Any(item =>
                !string.IsNullOrWhiteSpace(item.Value) &&
                !NameFilters.Contains(item.Key, StringComparer.OrdinalIgnoreCase)))
            return null;

        return entityKey.ToLowerInvariant() switch
        {
            "countries" => new CrystalReportDataSet(await BuildCountriesAsync(
                filters, cancellationToken)),
            "states" => new CrystalReportDataSet(await BuildStatesAsync(
                filters, cancellationToken)),
            _ => null
        };
    }

    private async Task<string> BuildCountriesAsync(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        var nameAr = Filter(filters, "NameAr", "CountryAr");
        var nameEn = Filter(filters, "NameEn", "CountryEn");
        var countries = context.Countries.AsNoTracking().Where(country => !country.IsDeleted);
        if (nameAr is not null)
            countries = countries.Where(country => country.NameAr == nameAr);
        if (nameEn is not null)
            countries = countries.Where(country => country.NameEn == nameEn);

        var rows = await (
            from country in countries
            join state in context.States.AsNoTracking().Where(state => !state.IsDeleted)
                on country.Id equals state.CountryId into countryStates
            from state in countryStates.DefaultIfEmpty()
            orderby country.Id, state == null ? 0 : state.Id
            select new CountryRow(
                country.Id,
                country.NameAr,
                country.NameEn,
                state == null ? null : state.Id,
                state == null ? null : state.NameAr,
                state == null ? null : state.NameEn))
            .ToListAsync(cancellationToken);

        var table = new DataTable("ReportData");
        table.Columns.Add("CountryId", typeof(int));
        table.Columns.Add("CountryAr", typeof(string));
        table.Columns.Add("CountryEn", typeof(string));
        table.Columns.Add("StateId", typeof(int)).AllowDBNull = true;
        table.Columns.Add("StateAr", typeof(string));
        table.Columns.Add("StateEn", typeof(string));
        foreach (var row in rows)
            table.Rows.Add(
                row.CountryId,
                row.CountryAr,
                row.CountryEn,
                row.StateId ?? (object)DBNull.Value,
                row.StateAr ?? (object)DBNull.Value,
                row.StateEn ?? (object)DBNull.Value);
        return WriteXml(table);
    }

    private async Task<string> BuildStatesAsync(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        var nameAr = Filter(filters, "NameAr", "StateAr");
        var nameEn = Filter(filters, "NameEn", "StateEn");
        var states = context.States.AsNoTracking().Where(state => !state.IsDeleted);
        if (nameAr is not null)
            states = states.Where(state => state.NameAr == nameAr);
        if (nameEn is not null)
            states = states.Where(state => state.NameEn == nameEn);

        var rows = await (
            from state in states
            join country in context.Countries.AsNoTracking().Where(country => !country.IsDeleted)
                on state.CountryId equals country.Id
            orderby state.Id
            select new StateRow(
                state.Id,
                state.NameAr,
                state.NameEn,
                state.Code,
                country.Id,
                country.NameAr,
                country.NameEn))
            .ToListAsync(cancellationToken);

        var table = new DataTable("ReportData");
        table.Columns.Add("StateId", typeof(int));
        table.Columns.Add("StateAr", typeof(string));
        table.Columns.Add("StateEn", typeof(string));
        table.Columns.Add("StateCode", typeof(string));
        table.Columns.Add("CountryId", typeof(int));
        table.Columns.Add("CountryAr", typeof(string));
        table.Columns.Add("CountryEn", typeof(string));
        foreach (var row in rows)
            table.Rows.Add(
                row.StateId,
                row.StateAr,
                row.StateEn,
                row.StateCode,
                row.CountryId,
                row.CountryAr,
                row.CountryEn);
        return WriteXml(table);
    }

    private static string? Filter(
        IReadOnlyDictionary<string, string?> filters,
        params string[] keys)
    {
        foreach (var key in keys)
        {
            var match = filters.FirstOrDefault(item =>
                string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(match.Value))
                return match.Value.Trim();
        }

        return null;
    }

    private static string WriteXml(DataTable table)
    {
        using var writer = new StringWriter(CultureInfo.InvariantCulture);
        table.WriteXml(writer, XmlWriteMode.WriteSchema);
        return writer.ToString();
    }

    private sealed record CountryRow(
        int CountryId,
        string CountryAr,
        string CountryEn,
        int? StateId,
        string? StateAr,
        string? StateEn);

    private sealed record StateRow(
        int StateId,
        string StateAr,
        string StateEn,
        string StateCode,
        int CountryId,
        string CountryAr,
        string CountryEn);
}
