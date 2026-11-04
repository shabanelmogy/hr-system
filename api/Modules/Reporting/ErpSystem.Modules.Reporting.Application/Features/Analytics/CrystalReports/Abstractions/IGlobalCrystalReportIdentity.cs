namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

public interface IGlobalCrystalReportIdentity
{
    string SourceId(Guid reportId);
    string Token(Guid versionId, string fingerprint, string sha256);
}
