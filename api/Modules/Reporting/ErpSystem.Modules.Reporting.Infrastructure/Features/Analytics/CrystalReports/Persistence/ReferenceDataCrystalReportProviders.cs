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
        AddColumn(table, "CountryId", typeof(int), nullable: false);
        AddColumn(table, "CountryAr", typeof(string), nullable: false);
        AddColumn(table, "CountryEn", typeof(string), nullable: false);
        AddColumn(table, "StateId", typeof(int), nullable: true);
        AddColumn(table, "StateAr", typeof(string), nullable: true);
        AddColumn(table, "StateEn", typeof(string), nullable: true);

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
        AddColumn(table, "StateId", typeof(int), nullable: false);
        AddColumn(table, "StateAr", typeof(string), nullable: false);
        AddColumn(table, "StateEn", typeof(string), nullable: false);
        AddColumn(table, "StateCode", typeof(string), nullable: false);
        AddColumn(table, "CountryId", typeof(int), nullable: false);
        AddColumn(table, "CountryAr", typeof(string), nullable: false);
        AddColumn(table, "CountryEn", typeof(string), nullable: false);

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
        AddColumn(table, "DistrictId", typeof(int), nullable: false);
        AddColumn(table, "DistrictAr", typeof(string), nullable: false);
        AddColumn(table, "DistrictEn", typeof(string), nullable: false);
        AddColumn(table, "DistrictCode", typeof(string), nullable: false);
        AddColumn(table, "StateId", typeof(int), nullable: false);
        AddColumn(table, "StateAr", typeof(string), nullable: false);
        AddColumn(table, "StateEn", typeof(string), nullable: false);
        AddColumn(table, "AddressesCount", typeof(int), nullable: false);

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
        AddColumn(table, "AddressTypeId", typeof(int), nullable: false);
        AddColumn(table, "AddressTypeAr", typeof(string), nullable: false);
        AddColumn(table, "AddressTypeEn", typeof(string), nullable: false);
        AddColumn(table, "AddressesCount", typeof(int), nullable: false);

        foreach (var row in rows)
            table.Rows.Add(row.AddressTypeId, row.AddressTypeAr, row.AddressTypeEn, row.AddressesCount);

        return Success(WriteXml(table));
    }
}
