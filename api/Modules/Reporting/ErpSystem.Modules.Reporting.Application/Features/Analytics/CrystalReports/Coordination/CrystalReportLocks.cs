namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Coordination;

internal static class CrystalReportLocks
{
    internal static string Report(Guid reportId) =>
        $"reporting:crystal-report:{reportId:N}";

    internal static string Identity(string entityKey, string reportKey) =>
        $"reporting:crystal-report-key:{entityKey}:{reportKey}";
}
