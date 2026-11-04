using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

/// <summary>Reviewed executable sources; never a discovery API for arbitrary database objects.</summary>
public interface ICrystalReportDesignSourceCatalog
{
    IReadOnlyList<CrystalReportDesignSource> Sources { get; }
}
