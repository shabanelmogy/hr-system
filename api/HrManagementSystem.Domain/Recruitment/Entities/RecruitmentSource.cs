using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class RecruitmentSource : TenantAuditableEntity
{
    private RecruitmentSource()
    {
    }

    public RecruitmentSource(
        string code,
        string nameAr,
        string nameEn,
        string type,
        bool isActive,
        int applicationsCount = 0,
        int hiredCount = 0)
    {
        Code = code;
        NameAr = nameAr;
        NameEn = nameEn;
        Type = type;
        IsActive = isActive;
        ApplicationsCount = applicationsCount;
        HiredCount = hiredCount;
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string Type { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public int ApplicationsCount { get; private set; }
    public int HiredCount { get; private set; }

    public void Update(
        string nameAr,
        string nameEn,
        string type,
        bool isActive)
    {
        NameAr = nameAr;
        NameEn = nameEn;
        Type = type;
        IsActive = isActive;
    }

    public void IncrementApplications() => ApplicationsCount++;
    public void IncrementHired() => HiredCount++;
}
