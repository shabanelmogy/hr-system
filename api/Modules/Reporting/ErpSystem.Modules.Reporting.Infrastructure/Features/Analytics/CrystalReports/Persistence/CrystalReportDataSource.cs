using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using System.Text;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class CrystalReportDataSource(
    IEnumerable<ICrystalReportDataProvider> providers,
    IOptions<Storage.CrystalReportStorageOptions> options)
    : ICrystalReportDataSource
{
    private readonly IReadOnlyDictionary<string, ICrystalReportDataProvider> _providers =
        BuildProviderMap(providers);

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
        return Encoding.UTF8.GetByteCount(result.Data.Xml) <= options.Value.MaxRuntimeDataSizeBytes
            ? result
            : new CrystalReportDataBuildResult(null, CrystalReportDataFailure.TooLarge);
    }

    private static CrystalReportDataBuildResult Unsupported() =>
        new(null, CrystalReportDataFailure.Unsupported);

    private static IReadOnlyDictionary<string, ICrystalReportDataProvider> BuildProviderMap(
        IEnumerable<ICrystalReportDataProvider> providers)
    {
        ArgumentNullException.ThrowIfNull(providers);

        var materialized = providers.ToArray();
        var duplicate = materialized
            .GroupBy(provider => provider.EntityKey, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1);
        if (duplicate is not null)
            throw new InvalidOperationException(
                $"Multiple Crystal report data providers are registered for entity key '{duplicate.Key}'.");

        return materialized.ToDictionary(
            provider => provider.EntityKey,
            StringComparer.OrdinalIgnoreCase);
    }
}
