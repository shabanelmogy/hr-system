namespace ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;

public sealed record EmailTemplateCriteria(string Language = "en", string? Search = null, string Status = "all", int Page = 1, int PageSize = 10);
public sealed record EmailTemplateVariable(string Token, string NameEn, string NameAr, string Sample, bool SubjectAllowed, bool Required);
public sealed record CompanyEmailTemplateRow(string Id, string NameEn, string NameAr, string Language, string Subject, string Body, bool IsCustomized, int Revision, IReadOnlyList<EmailTemplateVariable> Variables);
public sealed record CompanyEmailTemplatePage(IReadOnlyList<CompanyEmailTemplateRow> Items, int TotalCount, int Page, int PageSize, int Revision);
public sealed record ChangeEmailTemplateRequest(string Language, string Subject, string Body, int ExpectedRevision);
public sealed record ResetEmailTemplateRequest(string Language, int ExpectedRevision);
public sealed record PreviewEmailTemplateRequest(string Language, string? Subject = null, string? Body = null);
public sealed record RenderedAccountEmail(string Subject, string Html, string Text);
public sealed record ValidatedEmailContent(string Subject, string Body);

public interface ICompanyEmailTemplateReader
{
    Task<CompanyEmailTemplatePage?> ReadAsync(EmailTemplateCriteria criteria, CancellationToken token);
}
public interface ICompanyEmailTemplateWriter
{
    Task<Result> ChangeAsync(string id, string language, string? subject, string? body, int expectedRevision, bool reset, CancellationToken token);
}
public interface IAccountEmailContentPolicy
{
    ValidatedEmailContent? Validate(string subject, string body);
    RenderedAccountEmail Render(string subject, string body, string language, string name, string actionUrl);
}
public interface IAccountEmailRenderer
{
    Task<RenderedAccountEmail> RenderAsync(string templateId, string language, string name, string actionUrl, string? trustedTenantId, int? trustedCompanyId, CancellationToken token, string? recipientUserId = null);
}
public sealed class CompanyEmailTemplateErrors(IStringLocalizer<CompanyEmailTemplateErrors> localizer)
{
    public Error Invalid => new("CompanyEmailTemplates.Invalid", localizer["CompanyEmailTemplates.Invalid"], ErrorType.Validation);
    public Error Forbidden => new("CompanyEmailTemplates.Forbidden", localizer["CompanyEmailTemplates.Forbidden"], ErrorType.Forbidden);
    public Error Conflict => new("CompanyEmailTemplates.Conflict", localizer["CompanyEmailTemplates.Conflict"], ErrorType.Conflict);
}

public sealed record AccountEmailScope(string TenantId, int CompanyId);
public interface IAccountEmailScopeResolver
{
    Task<AccountEmailScope?> ResolveAsync(string? trustedTenantId, int? trustedCompanyId, string? recipientUserId, CancellationToken token);
}
