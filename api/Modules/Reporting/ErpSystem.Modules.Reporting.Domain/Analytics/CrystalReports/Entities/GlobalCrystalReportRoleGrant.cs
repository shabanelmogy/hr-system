using ErpSystem.BuildingBlocks.Domain.Entities;

namespace ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

public sealed class GlobalCrystalReportRoleGrant : AuditableEntity
{
    private GlobalCrystalReportRoleGrant() { }
    public Guid Id { get; private set; }
    public Guid GlobalCrystalReportId { get; private set; }
    public string RoleId { get; private set; } = string.Empty;
    public CrystalReportRight Rights { get; private set; }
    public GlobalCrystalReport Report { get; private set; } = null!;

    public static GlobalCrystalReportRoleGrant Create(Guid reportId, string roleId, CrystalReportRight rights)
    {
        var all = CrystalReportRight.Run | CrystalReportRight.Download | CrystalReportRight.Upload | CrystalReportRight.Publish;
        if (reportId == Guid.Empty || string.IsNullOrWhiteSpace(roleId) || roleId.Length > 450 ||
            rights == CrystalReportRight.None || (rights & ~all) != 0)
            throw new ArgumentException("A valid report, role and explicit rights are required.");
        return new GlobalCrystalReportRoleGrant { Id = Guid.NewGuid(), GlobalCrystalReportId = reportId, RoleId = roleId, Rights = rights };
    }
}
