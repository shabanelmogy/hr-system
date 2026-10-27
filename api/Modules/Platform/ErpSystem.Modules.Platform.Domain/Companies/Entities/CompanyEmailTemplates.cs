using System.Text.RegularExpressions;
using ErpSystem.BuildingBlocks.Domain.Abstractions;

namespace ErpSystem.Modules.Platform.Domain.Companies.Entities;

public sealed record AccountEmailDefinition(string Id, string NameEn, string NameAr,
    string SubjectEn, string SubjectAr, string HeadingEn, string HeadingAr)
{
    public string Subject(string language) => language == "ar" ? SubjectAr : SubjectEn;
    public string Body(string language) => language == "ar"
        ? $"<h2>{HeadingAr}</h2><p>مرحبًا {{FIRST_NAME}}،</p><p><a href=\"{{ACTION_URL}}\">متابعة</a></p>"
        : $"<h2>{HeadingEn}</h2><p>Hello {{FIRST_NAME}},</p><p><a href=\"{{ACTION_URL}}\">Continue</a></p>";
}

public static class AccountEmailCatalog
{
    public static IReadOnlyList<AccountEmailDefinition> Definitions { get; } = Array.AsReadOnly<AccountEmailDefinition>([
        new("email-confirmation", "Email confirmation", "تأكيد البريد الإلكتروني", "ERP System: Email confirmation", "نظام ERP: تأكيد البريد الإلكتروني", "Confirm your email", "تأكيد بريدك الإلكتروني"),
        new("password-reset", "Password reset", "استعادة كلمة المرور", "ERP System: Reset password", "نظام ERP: استعادة كلمة المرور", "Reset your password", "استعادة كلمة المرور"),
        new("user-invitation", "User invitation", "دعوة مستخدم", "ERP System: User invitation", "نظام ERP: دعوة مستخدم", "Accept your invitation", "قبول دعوتك")
    ]);
    public static AccountEmailDefinition? Find(string? id) => Definitions.SingleOrDefault(item => item.Id == id);
    public static bool IsLanguage(string? language) => language is "en" or "ar";
    private static readonly Regex Variable = new(@"\{[^{}]*\}", RegexOptions.Compiled, TimeSpan.FromSeconds(1));
    public static bool IsValidContent(string? subject, string? body)
    {
        if (string.IsNullOrWhiteSpace(subject) || subject.Length > 200 || subject.Any(char.IsControl) ||
            string.IsNullOrWhiteSpace(body) || body.Length > 50000) return false;
        var subjectTokens = Variable.Matches(subject).Select(match => match.Value);
        var bodyTokens = Variable.Matches(body).Select(match => match.Value).ToArray();
        return subjectTokens.All(value => value == "{FIRST_NAME}") &&
            bodyTokens.All(value => value is "{FIRST_NAME}" or "{ACTION_URL}") &&
            bodyTokens.Count(value => value == "{ACTION_URL}") == 1 &&
            !Variable.Replace(subject, "").Any(c => c is '{' or '}') &&
            !Variable.Replace(body, "").Any(c => c is '{' or '}');
    }
}

public sealed class CompanyEmailTemplateSettings : ICompanyScoped
{
    private readonly List<CompanyEmailTemplateOverride> _templates = [];
    private CompanyEmailTemplateSettings() { }
    public CompanyEmailTemplateSettings(string tenantId, int companyId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        if (tenantId.Length > 32 || companyId <= 0) throw new ArgumentException("Invalid company scope.");
        TenantId = tenantId; CompanyId = companyId;
    }
    public int Id { get; private set; }
    public string TenantId { get; private set; } = string.Empty;
    public int CompanyId { get; private set; }
    public int Revision { get; private set; }
    public byte[] RowVersion { get; private set; } = [];
    public IReadOnlyCollection<CompanyEmailTemplateOverride> Templates => _templates;
    string ITenantScoped.TenantId { get => TenantId; set => TenantId = value; }
    int ICompanyScoped.CompanyId { get => CompanyId; set => CompanyId = value; }

    public bool Change(string templateId, string language, string? subject, string? body, int expectedRevision, bool reset)
    {
        if (AccountEmailCatalog.Find(templateId) is null || !AccountEmailCatalog.IsLanguage(language))
            throw new ArgumentException("Unknown account email template or language.");
        if (expectedRevision != Revision) throw new InvalidOperationException("Email templates changed.");
        var item = _templates.SingleOrDefault(value => value.TemplateId == templateId && value.Language == language);
        if (reset)
        {
            if (item is null) return false;
            _templates.Remove(item);
        }
        else
        {
            if (!AccountEmailCatalog.IsValidContent(subject, body)) throw new ArgumentException("Invalid account email content.");
            if (item is not null && item.Subject == subject && item.Body == body) return false;
            if (item is null) _templates.Add(new(templateId, language, subject!, body!));
            else item.Change(subject!, body!);
        }
        Revision = checked(Revision + 1);
        return true;
    }
}

public sealed class CompanyEmailTemplateOverride
{
    private CompanyEmailTemplateOverride() { }
    internal CompanyEmailTemplateOverride(string templateId, string language, string subject, string body)
    { TemplateId = templateId; Language = language; Subject = subject; Body = body; }
    public int Id { get; private set; }
    public string TemplateId { get; private set; } = string.Empty;
    public string Language { get; private set; } = string.Empty;
    public string Subject { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    internal void Change(string subject, string body) { Subject = subject; Body = body; }
}
