using System.Data;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

internal sealed class CountriesCrystalReportDataProvider(IReferenceDataReportingSource referenceData)
    : CrystalReportDataProviderBase
{
    private static readonly IReadOnlySet<string> FiltersSet =
        Filters("NameAr", "NameEn");

    public override string EntityKey => "countries";
    protected override IReadOnlySet<string> ApprovedFilters => FiltersSet;

    protected override async Task<CrystalReportDataBuildResult> BuildAsyncCore(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        var rows = await referenceData.GetCountriesAsync(
            Filter(filters, "NameAr"),
            Filter(filters, "NameEn"),
            OverflowProbeRows,
            cancellationToken);
        if (ExceedsRowLimit(rows))
            return TooLarge();

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

        return Success(WriteXml(table));
    }
}

internal sealed class StatesCrystalReportDataProvider(IReferenceDataReportingSource referenceData)
    : CrystalReportDataProviderBase
{
    private static readonly IReadOnlySet<string> FiltersSet =
        Filters("NameAr", "NameEn");

    public override string EntityKey => "states";
    protected override IReadOnlySet<string> ApprovedFilters => FiltersSet;

    protected override async Task<CrystalReportDataBuildResult> BuildAsyncCore(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        var rows = await referenceData.GetStatesAsync(
            Filter(filters, "NameAr"),
            Filter(filters, "NameEn"),
            OverflowProbeRows,
            cancellationToken);
        if (ExceedsRowLimit(rows))
            return TooLarge();

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

        return Success(WriteXml(table));
    }
}

internal sealed class DistrictsCrystalReportDataProvider(IReferenceDataReportingSource referenceData)
    : CrystalReportDataProviderBase
{
    private static readonly IReadOnlySet<string> FiltersSet =
        Filters("NameAr", "NameEn", "StateAr", "StateEn");

    public override string EntityKey => "districts";
    protected override IReadOnlySet<string> ApprovedFilters => FiltersSet;

    protected override async Task<CrystalReportDataBuildResult> BuildAsyncCore(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        var rows = await referenceData.GetDistrictsAsync(
            Filter(filters, "NameAr"),
            Filter(filters, "NameEn"),
            Filter(filters, "StateAr"),
            Filter(filters, "StateEn"),
            OverflowProbeRows,
            cancellationToken);
        if (ExceedsRowLimit(rows))
            return TooLarge();

        var table = new DataTable("ReportData");
        table.Columns.Add("DistrictId", typeof(int));
        table.Columns.Add("DistrictAr", typeof(string));
        table.Columns.Add("DistrictEn", typeof(string));
        table.Columns.Add("DistrictCode", typeof(string));
        table.Columns.Add("StateId", typeof(int));
        table.Columns.Add("StateAr", typeof(string));
        table.Columns.Add("StateEn", typeof(string));
        table.Columns.Add("AddressesCount", typeof(int));

        foreach (var row in rows)
            table.Rows.Add(
                row.DistrictId,
                row.DistrictAr,
                row.DistrictEn,
                row.DistrictCode,
                row.StateId,
                row.StateAr,
                row.StateEn,
                row.AddressesCount);

        return Success(WriteXml(table));
    }
}

internal sealed class AddressTypesCrystalReportDataProvider(IReferenceDataReportingSource referenceData)
    : CrystalReportDataProviderBase
{
    private static readonly IReadOnlySet<string> FiltersSet =
        Filters("NameAr", "NameEn");

    public override string EntityKey => "addresstypes";
    protected override IReadOnlySet<string> ApprovedFilters => FiltersSet;

    protected override async Task<CrystalReportDataBuildResult> BuildAsyncCore(
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        var rows = await referenceData.GetAddressTypesAsync(
            Filter(filters, "NameAr"),
            Filter(filters, "NameEn"),
            OverflowProbeRows,
            cancellationToken);
        if (ExceedsRowLimit(rows))
            return TooLarge();

        var table = new DataTable("ReportData");
        table.Columns.Add("AddressTypeId", typeof(int));
        table.Columns.Add("AddressTypeAr", typeof(string));
        table.Columns.Add("AddressTypeEn", typeof(string));
        table.Columns.Add("AddressesCount", typeof(int));

        foreach (var row in rows)
            table.Rows.Add(row.AddressTypeId, row.AddressTypeAr, row.AddressTypeEn, row.AddressesCount);

        return Success(WriteXml(table));
    }
}
