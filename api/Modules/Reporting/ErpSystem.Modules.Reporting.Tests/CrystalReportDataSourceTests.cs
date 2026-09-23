using ErpSystem.Modules.Accounting.Contracts.Reporting;
using ErpSystem.Modules.ReferenceData.Contracts.Reporting;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportDataSourceTests
{
    [Fact]
    public async Task BuildAsync_FiscalYears_UsesAccountingOwnedDataAndStablePeriodSchema()
    {
        var referenceData = new RecordingReferenceDataSource();
        var accounting = new RecordingAccountingDataSource();
        var source = CreateSource(referenceData, accounting);

        var result = await source.BuildAsync(
            "fiscalyears",
            new Dictionary<string, string?>
            {
                ["Code"] = "FY-2027",
                ["NameEn"] = "Fiscal Year 2027"
            },
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal(("FY-2027", null, "Fiscal Year 2027"), accounting.Filter);
        Assert.Contains("FiscalYearCode", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("FiscalYearStatus", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("FiscalPeriodSequence", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("FiscalPeriodStatus", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("FY-2027-P01", result.Data.Xml, StringComparison.Ordinal);
    }

    [Fact]
    public async Task BuildAsync_Countries_UsesStableSchemaAndForwardsApprovedFilters()
    {
        var referenceData = new RecordingReferenceDataSource();
        var source = CreateSource(referenceData);

        var result = await source.BuildAsync(
            "countries",
            new Dictionary<string, string?> { ["NameEn"] = "Egypt" },
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal((null, "Egypt"), referenceData.CountryFilter);
        Assert.Contains("CountryId", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("CountryEn", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("StateId", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("Egypt", result.Data.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Jordan", result.Data.Xml, StringComparison.Ordinal);
    }

    [Fact]
    public async Task BuildAsync_RejectsEntitiesWithoutAnApprovedDataProfile()
    {
        var referenceData = new RecordingReferenceDataSource();
        var source = CreateSource(referenceData);

        var result = await source.BuildAsync(
            "addresses",
            new Dictionary<string, string?>(),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Null(result.Data);
        Assert.Equal(CrystalReportDataFailure.Unsupported, result.Failure);
        Assert.Equal(0, referenceData.CallCount);
    }

    [Fact]
    public async Task BuildAsync_Districts_UsesStableSchemaAndForwardsDistrictStateFilters()
    {
        var referenceData = new RecordingReferenceDataSource();
        var source = CreateSource(referenceData);

        var result = await source.BuildAsync(
            "districts",
            new Dictionary<string, string?>
            {
                ["NameEn"] = "Maadi",
                ["StateEn"] = "Cairo"
            },
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal((null, "Maadi", null, "Cairo"), referenceData.DistrictFilter);
        Assert.Contains("DistrictId", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("DistrictCode", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("StateEn", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("AddressesCount", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("Maadi", result.Data.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Zamalek", result.Data.Xml, StringComparison.Ordinal);

        var unsupportedFilter = await source.BuildAsync(
            "districts",
            new Dictionary<string, string?> { ["Code"] = "MAA" },
            CancellationToken.None);
        Assert.False(unsupportedFilter.IsSuccess);
        Assert.Null(unsupportedFilter.Data);
        Assert.Equal(CrystalReportDataFailure.Unsupported, unsupportedFilter.Failure);
    }

    [Fact]
    public async Task BuildAsync_AddressTypes_UsesStableSchemaAndForwardsFilters()
    {
        var referenceData = new RecordingReferenceDataSource();
        var source = CreateSource(referenceData);

        var result = await source.BuildAsync(
            "addresstypes",
            new Dictionary<string, string?> { ["NameEn"] = "Residence" },
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal((null, "Residence"), referenceData.AddressTypeFilter);
        Assert.Contains("AddressTypeId", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("AddressTypeEn", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("AddressesCount", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains("Residence", result.Data.Xml, StringComparison.Ordinal);
        Assert.Contains(">1<", result.Data.Xml, StringComparison.Ordinal);
        Assert.DoesNotContain("Work", result.Data.Xml, StringComparison.Ordinal);

        var unsupportedFilter = await source.BuildAsync(
            "addresstypes",
            new Dictionary<string, string?> { ["AddressesCount"] = "1" },
            CancellationToken.None);
        Assert.False(unsupportedFilter.IsSuccess);
        Assert.Null(unsupportedFilter.Data);
        Assert.Equal(CrystalReportDataFailure.Unsupported, unsupportedFilter.Failure);
    }

    [Fact]
    public async Task BuildAsync_RejectsUnknownAndLegacyAliasFilters_EvenWhenValueIsEmpty()
    {
        var referenceData = new RecordingReferenceDataSource();
        var source = CreateSource(referenceData);

        var unknown = await source.BuildAsync(
            "countries",
            new Dictionary<string, string?> { ["Unknown"] = null },
            CancellationToken.None);
        var legacyAlias = await source.BuildAsync(
            "countries",
            new Dictionary<string, string?> { ["CountryEn"] = "Egypt" },
            CancellationToken.None);

        Assert.Equal(CrystalReportDataFailure.Unsupported, unknown.Failure);
        Assert.Equal(CrystalReportDataFailure.Unsupported, legacyAlias.Failure);
        Assert.Equal(0, referenceData.CallCount);
    }

    [Fact]
    public async Task BuildAsync_RejectsRuntimeDataThatExceedsConfiguredByteLimit()
    {
        var source = new CrystalReportDataSource(
            [new StubProvider("countries", "<ReportData>oversized</ReportData>")],
            Options.Create(new CrystalReportStorageOptions
            {
                MaxRuntimeDataSizeBytes = 8
            }));

        var result = await source.BuildAsync(
            "countries",
            new Dictionary<string, string?>(),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Null(result.Data);
        Assert.Equal(CrystalReportDataFailure.TooLarge, result.Failure);
    }

    [Fact]
    public async Task BuildAsync_PropagatesProviderRowLimitFailure()
    {
        var source = new CrystalReportDataSource(
            [new StubProvider("countries", CrystalReportDataFailure.TooLarge)],
            Options.Create(new CrystalReportStorageOptions()));

        var result = await source.BuildAsync(
            "countries",
            new Dictionary<string, string?>(),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Null(result.Data);
        Assert.Equal(CrystalReportDataFailure.TooLarge, result.Failure);
    }

    [Fact]
    public void Constructor_RejectsDuplicateEntityProviders()
    {
        var provider = new StubProvider("countries");

        Assert.Throws<InvalidOperationException>(() =>
            new CrystalReportDataSource(
                [provider, new StubProvider("COUNTRIES")],
                Options.Create(new CrystalReportStorageOptions())));
    }

    private static CrystalReportDataSource CreateSource(
        IReferenceDataReportingSource referenceData,
        IAccountingReportingSource? accounting = null) =>
        new(
            [
                new CountriesCrystalReportDataProvider(referenceData),
                new StatesCrystalReportDataProvider(referenceData),
                new DistrictsCrystalReportDataProvider(referenceData),
                new AddressTypesCrystalReportDataProvider(referenceData),
                new FiscalYearsCrystalReportDataProvider(accounting ?? new RecordingAccountingDataSource())
            ],
            Options.Create(new CrystalReportStorageOptions()));

    private sealed class StubProvider : ICrystalReportDataProvider
    {
        private readonly CrystalReportDataBuildResult _result;

        public StubProvider(string entityKey)
            : this(entityKey, CrystalReportDataFailure.Unsupported)
        {
        }

        public StubProvider(string entityKey, string xml)
        {
            EntityKey = entityKey;
            _result = new CrystalReportDataBuildResult(
                new CrystalReportDataSet(xml),
                CrystalReportDataFailure.None);
        }

        public StubProvider(string entityKey, CrystalReportDataFailure failure)
        {
            EntityKey = entityKey;
            _result = new CrystalReportDataBuildResult(null, failure);
        }

        public string EntityKey { get; }

        public Task<CrystalReportDataBuildResult> BuildAsync(
            IReadOnlyDictionary<string, string?> filters,
            CancellationToken cancellationToken) =>
            Task.FromResult(_result);
    }

    private sealed class RecordingReferenceDataSource : IReferenceDataReportingSource
    {
        public int CallCount { get; private set; }
        public (string? NameAr, string? NameEn)? CountryFilter { get; private set; }
        public (string? NameAr, string? NameEn, string? StateAr, string? StateEn)? DistrictFilter { get; private set; }
        public (string? NameAr, string? NameEn)? AddressTypeFilter { get; private set; }

        public Task<IReadOnlyList<ReferenceCountryReportRow>> GetCountriesAsync(
            string? nameAr,
            string? nameEn,
            int maximumRows,
            CancellationToken cancellationToken)
        {
            CallCount++;
            CountryFilter = (nameAr, nameEn);
            IReadOnlyList<ReferenceCountryReportRow> rows =
            [
                new(1, "مصر", "Egypt", 10, "القاهرة", "Cairo"),
                new(2, "الأردن", "Jordan", null, null, null)
            ];
            return Task.FromResult<IReadOnlyList<ReferenceCountryReportRow>>(rows
                .Where(row => (nameAr is null || row.CountryAr == nameAr) &&
                              (nameEn is null || row.CountryEn == nameEn))
                .Take(maximumRows)
                .ToArray());
        }

        public Task<IReadOnlyList<ReferenceStateReportRow>> GetStatesAsync(
            string? nameAr,
            string? nameEn,
            int maximumRows,
            CancellationToken cancellationToken)
        {
            CallCount++;
            IReadOnlyList<ReferenceStateReportRow> rows = [];
            return Task.FromResult(rows);
        }

        public Task<IReadOnlyList<ReferenceDistrictReportRow>> GetDistrictsAsync(
            string? nameAr,
            string? nameEn,
            string? stateAr,
            string? stateEn,
            int maximumRows,
            CancellationToken cancellationToken)
        {
            CallCount++;
            DistrictFilter = (nameAr, nameEn, stateAr, stateEn);
            IReadOnlyList<ReferenceDistrictReportRow> rows =
            [
                new(1, "المعادي", "Maadi", "MAA", 10, "القاهرة", "Cairo", 2),
                new(2, "الزمالك", "Zamalek", "ZAM", 10, "القاهرة", "Cairo", 1)
            ];
            return Task.FromResult<IReadOnlyList<ReferenceDistrictReportRow>>(rows
                .Where(row => (nameAr is null || row.DistrictAr == nameAr) &&
                              (nameEn is null || row.DistrictEn == nameEn) &&
                              (stateAr is null || row.StateAr == stateAr) &&
                              (stateEn is null || row.StateEn == stateEn))
                .Take(maximumRows)
                .ToArray());
        }

        public Task<IReadOnlyList<ReferenceAddressTypeReportRow>> GetAddressTypesAsync(
            string? nameAr,
            string? nameEn,
            int maximumRows,
            CancellationToken cancellationToken)
        {
            CallCount++;
            AddressTypeFilter = (nameAr, nameEn);
            IReadOnlyList<ReferenceAddressTypeReportRow> rows =
            [
                new(1, "سكن", "Residence", 1),
                new(2, "عمل", "Work", 3)
            ];
            return Task.FromResult<IReadOnlyList<ReferenceAddressTypeReportRow>>(rows
                .Where(row => (nameAr is null || row.AddressTypeAr == nameAr) &&
                              (nameEn is null || row.AddressTypeEn == nameEn))
                .Take(maximumRows)
                .ToArray());
        }
    }

    private sealed class RecordingAccountingDataSource : IAccountingReportingSource
    {
        public (string? Code, string? NameAr, string? NameEn)? Filter { get; private set; }

        public Task<IReadOnlyList<AccountingFiscalYearReportRow>> GetFiscalYearsAsync(
            string? code,
            string? nameAr,
            string? nameEn,
            int maximumRows,
            CancellationToken cancellationToken)
        {
            Filter = (code, nameAr, nameEn);
            IReadOnlyList<AccountingFiscalYearReportRow> rows =
            [
                new(
                    1,
                    "FY-2027",
                    "السنة المالية 2027",
                    "Fiscal Year 2027",
                    new DateOnly(2027, 1, 1),
                    new DateOnly(2027, 12, 31),
                    "Monthly",
                    "Open",
                    10,
                    1,
                    "FY-2027-P01",
                    "الفترة 1",
                    "Period 1",
                    new DateOnly(2027, 1, 1),
                    new DateOnly(2027, 1, 31),
                    "Open")
            ];
            return Task.FromResult<IReadOnlyList<AccountingFiscalYearReportRow>>(rows
                .Where(row => (code is null || row.FiscalYearCode == code)
                              && (nameAr is null || row.FiscalYearAr == nameAr)
                              && (nameEn is null || row.FiscalYearEn == nameEn))
                .Take(maximumRows)
                .ToArray());
        }
    }
}
