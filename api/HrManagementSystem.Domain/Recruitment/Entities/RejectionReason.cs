using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class RejectionReason : TenantAuditableEntity
{
    private RejectionReason()
    {
    }

    public RejectionReason(
        string code,
        string reasonAr,
        string reasonEn,
        string category,
        bool sendAutoEmail,
        string? emailSubjectAr = null,
        string? emailSubjectEn = null,
        string? emailBodyAr = null,
        string? emailBodyEn = null)
    {
        Code = code;
        ReasonAr = reasonAr;
        ReasonEn = reasonEn;
        Category = category;
        SendAutoEmail = sendAutoEmail;
        EmailSubjectAr = emailSubjectAr;
        EmailSubjectEn = emailSubjectEn;
        EmailBodyAr = emailBodyAr;
        EmailBodyEn = emailBodyEn;
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string ReasonAr { get; private set; } = string.Empty;
    public string ReasonEn { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public bool SendAutoEmail { get; private set; }
    public string? EmailSubjectAr { get; private set; }
    public string? EmailSubjectEn { get; private set; }
    public string? EmailBodyAr { get; private set; }
    public string? EmailBodyEn { get; private set; }

    public void Update(
        string reasonAr,
        string reasonEn,
        string category,
        bool sendAutoEmail,
        string? emailSubjectAr = null,
        string? emailSubjectEn = null,
        string? emailBodyAr = null,
        string? emailBodyEn = null)
    {
        ReasonAr = reasonAr;
        ReasonEn = reasonEn;
        Category = category;
        SendAutoEmail = sendAutoEmail;
        EmailSubjectAr = emailSubjectAr;
        EmailSubjectEn = emailSubjectEn;
        EmailBodyAr = emailBodyAr;
        EmailBodyEn = emailBodyEn;
    }
}
