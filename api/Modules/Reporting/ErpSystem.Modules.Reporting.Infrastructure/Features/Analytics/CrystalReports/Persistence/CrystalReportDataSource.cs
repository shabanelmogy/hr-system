using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using System.Text;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class CrystalReportDataSource : ICrystalReportDataSource
{
    private readonly IReadOnlyDictionary<string, ICrystalReportDataProvider> _providers;
    private readonly IOptions<Storage.CrystalReportStorageOptions> _options;
    private readonly ManagedCrystalReportContractRegistry _contracts;

    public CrystalReportDataSource(
        IEnumerable<ICrystalReportDataProvider> providers,
        IOptions<Storage.CrystalReportStorageOptions> options)
        : this(providers, options, ManagedCrystalReportContractRegistry.LoadEmbedded(), false)
    {
    }

    public CrystalReportDataSource(
        IEnumerable<ICrystalReportDataProvider> providers,
        IOptions<Storage.CrystalReportStorageOptions> options,
        ManagedCrystalReportContractRegistry contracts)
        : this(providers, options, contracts, true)
    {
    }

    private CrystalReportDataSource(
        IEnumerable<ICrystalReportDataProvider> providers,
        IOptions<Storage.CrystalReportStorageOptions> options,
        ManagedCrystalReportContractRegistry contracts,
        bool requireCompleteRegistry)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(contracts);
        _options = options;
        _contracts = contracts;
        _providers = BuildProviderMap(providers, contracts, requireCompleteRegistry);
    }

    public async Task<CrystalReportDataBuildResult> BuildAsync(
        string entityKey,
        IReadOnlyDictionary<string, string?> filters,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(entityKey))
            return Unsupported();

        var normalizedEntityKey = entityKey.Trim();
        if (!_providers.TryGetValue(normalizedEntityKey, out var provider))
            return Unsupported();

        var result = await provider.BuildAsync(filters, cancellationToken);
        if (!result.IsSuccess)
            return result;
        if (string.IsNullOrWhiteSpace(result.Data!.Xml))
            return Unsupported();
        if (Encoding.UTF8.GetByteCount(result.Data.Xml) > _options.Value.MaxRuntimeDataSizeBytes)
            return new CrystalReportDataBuildResult(null, CrystalReportDataFailure.TooLarge);

        _contracts.ValidateDataSetXml(provider.EntityKey, result.Data.Xml);
        return result;
    }

    private static CrystalReportDataBuildResult Unsupported() =>
        new(null, CrystalReportDataFailure.Unsupported);

    private static IReadOnlyDictionary<string, ICrystalReportDataProvider> BuildProviderMap(
        IEnumerable<ICrystalReportDataProvider> providers,
        ManagedCrystalReportContractRegistry contracts,
        bool requireCompleteRegistry)
    {
        ArgumentNullException.ThrowIfNull(providers);

        var materialized = providers.ToArray();
        var duplicate = materialized
            .GroupBy(provider => provider.EntityKey, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1);
        if (duplicate is not null)
            throw new InvalidOperationException(
                $"Multiple Crystal report data providers are registered for entity key '{duplicate.Key}'.");

        foreach (var provider in materialized)
            _ = contracts.GetRequired(provider.EntityKey);

        if (requireCompleteRegistry && materialized.Length != contracts.Count)
        {
            throw new InvalidOperationException(
                "Every managed Crystal report contract must have exactly one registered data provider.");
        }

        return materialized.ToDictionary(
            provider => provider.EntityKey,
            StringComparer.OrdinalIgnoreCase);
    }
}
