using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Security;

/// <summary>Preserves the global preview's opaque64hex identity/concurrency envelope.</summary>
public sealed class GlobalCrystalReportIdentity : IGlobalCrystalReportIdentity
{
    public string SourceId(Guid reportId) => Hash("managed-global\n" + reportId.ToString("N"));
    public string Token(Guid versionId, string fingerprint, string sha256) =>
        Hash(versionId.ToString("N") + "\n" + fingerprint + "\n" + sha256);
    private static string Hash(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value))).ToLowerInvariant();
}
