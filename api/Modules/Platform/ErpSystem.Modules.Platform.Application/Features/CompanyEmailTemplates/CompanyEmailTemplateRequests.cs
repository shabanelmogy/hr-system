using ErpSystem.Modules.Platform.Domain.Companies.Entities;

namespace ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;

public sealed record GetCompanyEmailTemplatesQuery(EmailTemplateCriteria Criteria) : IQuery<Result<CompanyEmailTemplatePage>>;
public sealed record PreviewCompanyEmailTemplateQuery(string Id, PreviewEmailTemplateRequest Request) : IQuery<Result<RenderedAccountEmail>>;
public sealed record ChangeCompanyEmailTemplateCommand(string Id, ChangeEmailTemplateRequest Request) : ICommand<Result>;
public sealed record ResetCompanyEmailTemplateCommand(string Id, ResetEmailTemplateRequest Request) : ICommand<Result>;

public sealed class EmailTemplateCriteriaValidator : AbstractValidator<GetCompanyEmailTemplatesQuery>
{
    public EmailTemplateCriteriaValidator()
    {
        RuleFor(value => value.Criteria.Language).Must(AccountEmailCatalog.IsLanguage);
        RuleFor(value => value.Criteria.Search).MaximumLength(200);
        RuleFor(value => value.Criteria.Status).Must(value => value is "all" or "customized" or "default");
        RuleFor(value => value.Criteria.Page).InclusiveBetween(1, 100000);
        RuleFor(value => value.Criteria.PageSize).InclusiveBetween(1, 100);
    }
}
public sealed class ChangeEmailTemplateValidator : AbstractValidator<ChangeCompanyEmailTemplateCommand>
{
    public ChangeEmailTemplateValidator(IAccountEmailContentPolicy policy, IStringLocalizer<CompanyEmailTemplateErrors> localizer)
    {
        RuleFor(value => value.Id).Must(id => AccountEmailCatalog.Find(id) is not null);
        RuleFor(value => value.Request.Language).Must(AccountEmailCatalog.IsLanguage);
        RuleFor(value => value.Request.ExpectedRevision).GreaterThanOrEqualTo(0);
        RuleFor(value => value.Request.Subject).NotEmpty().MaximumLength(200).Must(value => value is not null && !value.Any(char.IsControl));
        RuleFor(value => value.Request.Body).NotEmpty().MaximumLength(50000)
            .Must((command, body) => policy.Validate(command.Request.Subject, body) is not null)
            .WithMessage(localizer["CompanyEmailTemplates.Invalid"]);
    }
}

public sealed class CompanyEmailTemplateQueries(ICompanyEmailTemplateReader reader, IAccountEmailContentPolicy policy, CompanyEmailTemplateErrors errors)
    : IQueryHandler<GetCompanyEmailTemplatesQuery, Result<CompanyEmailTemplatePage>>,
      IQueryHandler<PreviewCompanyEmailTemplateQuery, Result<RenderedAccountEmail>>
{
    public async Task<Result<CompanyEmailTemplatePage>> Handle(GetCompanyEmailTemplatesQuery request, CancellationToken token)
    {
        var q = request.Criteria;
        if (!AccountEmailCatalog.IsLanguage(q.Language) || q.Page is <1 or >100000 || q.PageSize is <1 or >100 ||
            (q.Search?.Length ?? 0) > 200 || q.Status is not ("all" or "customized" or "default"))
            return Result.Failure<CompanyEmailTemplatePage>(errors.Invalid);
        var result = await reader.ReadAsync(q, token);
        return result is null ? Result.Failure<CompanyEmailTemplatePage>(errors.Forbidden) : Result.Success(result);
    }
    public async Task<Result<RenderedAccountEmail>> Handle(PreviewCompanyEmailTemplateQuery query, CancellationToken token)
    {
        var request = query.Request;
        if (AccountEmailCatalog.Find(query.Id) is null || !AccountEmailCatalog.IsLanguage(request.Language))
            return Result.Failure<RenderedAccountEmail>(errors.Invalid);
        var page = await reader.ReadAsync(new(request.Language), token);
        if (page is null) return Result.Failure<RenderedAccountEmail>(errors.Forbidden);
        var row = page.Items.Single(item => item.Id == query.Id);
        var content = policy.Validate(request.Subject ?? row.Subject, request.Body ?? row.Body);
        return content is null ? Result.Failure<RenderedAccountEmail>(errors.Invalid)
            : Result.Success(policy.Render(content.Subject, content.Body, request.Language, request.Language == "ar" ? "أحمد" : "Alex", "https://example.invalid/account-action"));
    }
}
public sealed class CompanyEmailTemplateCommands(ICompanyEmailTemplateWriter writer, IAccountEmailContentPolicy policy, CompanyEmailTemplateErrors errors)
    : ICommandHandler<ChangeCompanyEmailTemplateCommand, Result>, ICommandHandler<ResetCompanyEmailTemplateCommand, Result>
{
    public Task<Result> Handle(ChangeCompanyEmailTemplateCommand command, CancellationToken token)
    {
        var request = command.Request;
        if (AccountEmailCatalog.Find(command.Id) is null || !AccountEmailCatalog.IsLanguage(request.Language) || request.ExpectedRevision < 0)
            return Task.FromResult(Result.Failure(errors.Invalid));
        var content = policy.Validate(request.Subject, request.Body);
        return content is null ? Task.FromResult(Result.Failure(errors.Invalid))
            : writer.ChangeAsync(command.Id, request.Language, content.Subject, content.Body, request.ExpectedRevision, false, token);
    }
    public Task<Result> Handle(ResetCompanyEmailTemplateCommand command, CancellationToken token)
    {
        var request = command.Request;
        return AccountEmailCatalog.Find(command.Id) is null || !AccountEmailCatalog.IsLanguage(request.Language) || request.ExpectedRevision < 0
            ? Task.FromResult(Result.Failure(errors.Invalid))
            : writer.ChangeAsync(command.Id, request.Language, null, null, request.ExpectedRevision, true, token);
    }
}
