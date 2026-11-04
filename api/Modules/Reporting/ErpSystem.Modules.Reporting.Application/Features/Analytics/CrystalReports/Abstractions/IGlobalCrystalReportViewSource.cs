using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

public sealed record GlobalCrystalReportViewBinding(string ViewName, string Fingerprint);

public interface IGlobalCrystalReportViewSource
{
    Task<GlobalCrystalReportViewBinding?> InspectAsync(string sourceKey, string viewName, CancellationToken cancellationToken);
    Task<CrystalReportDataBuildResult> BuildAsync(string sourceKey, string viewName, string fingerprint,
        IReadOnlyDictionary<string, string?> filters, CancellationToken cancellationToken);
}
