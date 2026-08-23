using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Analytics.CrystalReports.Entities;

[Flags]
public enum CrystalReportRight
{
    None = 0,
    Run = 1,
    Download = 2,
    Upload = 4,
    Publish = 8,
    ManageAccess = 16
}

public sealed class CrystalReportRoleGrant : CompanyAuditableEntity
{
    private CrystalReportRoleGrant() { }

    public Guid Id { get; private set; }
    public Guid CrystalReportId { get; private set; }
    public string RoleId { get; private set; } = string.Empty;
    public CrystalReportRight Rights { get; private set; }
    public CrystalReport CrystalReport { get; private set; } = null!;

    public static CrystalReportRoleGrant Create(
        Guid reportId,
        string roleId,
        CrystalReportRight rights)
        => new()
        {
            Id = Guid.NewGuid(),
            CrystalReportId = reportId,
            RoleId = roleId,
            Rights = rights
        };

    public void ReplaceRights(CrystalReportRight rights) => Rights = rights;
}
