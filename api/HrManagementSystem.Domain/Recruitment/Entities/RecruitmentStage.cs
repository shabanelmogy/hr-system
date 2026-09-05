using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class RecruitmentStage : TenantAuditableEntity
{
    private RecruitmentStage()
    {
    }

    public RecruitmentStage(
        string code,
        string nameAr,
        string nameEn,
        int sequence,
        string color,
        bool foldedInKanban,
        bool isDefault,
        bool sendEmailNotification,
        int mappedStatus,
        string? emailTemplate = null)
    {
        Code = code;
        NameAr = nameAr;
        NameEn = nameEn;
        Sequence = sequence;
        Color = color;
        FoldedInKanban = foldedInKanban;
        IsDefault = isDefault;
        SendEmailNotification = sendEmailNotification;
        MappedStatus = mappedStatus;
        EmailTemplate = emailTemplate;
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public int Sequence { get; private set; }
    public string Color { get; private set; } = "#1976d2";
    public bool FoldedInKanban { get; private set; }
    public bool IsDefault { get; private set; }
    public bool SendEmailNotification { get; private set; }
    public int MappedStatus { get; private set; }
    public string? EmailTemplate { get; private set; }

    public void Update(
        string nameAr,
        string nameEn,
        int sequence,
        string color,
        bool foldedInKanban,
        bool isDefault,
        bool sendEmailNotification,
        int mappedStatus,
        string? emailTemplate = null)
    {
        NameAr = nameAr;
        NameEn = nameEn;
        Sequence = sequence;
        Color = color;
        FoldedInKanban = foldedInKanban;
        IsDefault = isDefault;
        SendEmailNotification = sendEmailNotification;
        MappedStatus = mappedStatus;
        EmailTemplate = emailTemplate;
    }
}
