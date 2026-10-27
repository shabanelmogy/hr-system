using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.MessageLogs;

namespace ErpSystem.Modules.Platform.Application.Features.MessageLogs;

public sealed record MessageLogCriteria(DateTime? FromUtc = null, DateTime? ToUtc = null, string? Status = null,
    string? TemplateId = null, string? Recipient = null, string? Search = null, int Page = 1, int PageSize = 25);
public sealed record MessageLogRow(Guid Id, DateTime StartedOnUtc, DateTime? CompletedOnUtc, long? DurationMs,
    string Type, string TemplateId, string Language, string Recipient, string Subject, string Status, string Phase,
    string? Cause, int? SmtpStatusCode, string? CorrelationId, bool SnapshotTruncated);
public sealed record MessageLogPage(IReadOnlyList<MessageLogRow> Items, int TotalCount, int Page, int PageSize);
public sealed record MessageLogDetail(MessageLogRow Entry, string? SnapshotHtml);
public sealed record MessageLogExport(byte[] Contents, string FileName);
public interface IMessageLogReader
{
    Task<bool> HasScopeAsync(CancellationToken token);
    Task<MessageLogPage> ListAsync(MessageLogCriteria criteria, CancellationToken token);
    Task<MessageLogDetail?> DetailAsync(Guid id, CancellationToken token);
    Task<MessageLogExport?> ExportAsync(MessageLogCriteria criteria, CancellationToken token);
}
public sealed record MessageAttemptStart(string TenantId, int CompanyId, string? UserId, string? CorrelationId,
    DateTime StartedOnUtc, string TemplateId, string Language, string Recipient);
public sealed record MessageAttemptSnapshot(string Subject, string Html, bool Truncated);
public sealed record MessageAttemptCompletion(DateTime CompletedOnUtc, long DurationMs, string Status, string Phase, string? Cause, int? SmtpStatusCode);
public interface IMessageAttemptRecorder
{
    Task<Guid?> StartAsync(MessageAttemptStart attempt);
    Task SnapshotAsync(Guid id, MessageAttemptStart attempt, MessageAttemptSnapshot snapshot);
    Task CompleteAsync(Guid id, MessageAttemptStart attempt, MessageAttemptCompletion completion);
}
public sealed record ListMessageLogsQuery(MessageLogCriteria Criteria) : IQuery<Result<MessageLogPage>>;
public sealed record GetMessageLogQuery(Guid Id) : IQuery<Result<MessageLogDetail>>;
public sealed record ExportMessageLogsQuery(MessageLogCriteria Criteria) : IQuery<Result<MessageLogExport>>;

public sealed class MessageLogHandler(IMessageLogReader reader, IStringLocalizer<MessageLogHandler> localizer) :
    IQueryHandler<ListMessageLogsQuery, Result<MessageLogPage>>,
    IQueryHandler<GetMessageLogQuery, Result<MessageLogDetail>>,
    IQueryHandler<ExportMessageLogsQuery, Result<MessageLogExport>>
{
    private Error Error(string code, ErrorType type) => new("MessageLogs." + code, localizer["MessageLogs." + code], type);
    public async Task<Result<MessageLogPage>> Handle(ListMessageLogsQuery request, CancellationToken token) =>
        await reader.HasScopeAsync(token) ? Result.Success(await reader.ListAsync(request.Criteria, token)) : Result.Failure<MessageLogPage>(Error("Forbidden", ErrorType.Forbidden));
    public async Task<Result<MessageLogDetail>> Handle(GetMessageLogQuery request, CancellationToken token)
    {
        if (!await reader.HasScopeAsync(token)) return Result.Failure<MessageLogDetail>(Error("Forbidden", ErrorType.Forbidden));
        var detail = await reader.DetailAsync(request.Id, token);
        return detail is null ? Result.Failure<MessageLogDetail>(Error("NotFound", ErrorType.NotFound)) : Result.Success(detail);
    }
    public async Task<Result<MessageLogExport>> Handle(ExportMessageLogsQuery request, CancellationToken token)
    {
        if (!await reader.HasScopeAsync(token)) return Result.Failure<MessageLogExport>(Error("Forbidden", ErrorType.Forbidden));
        var value = await reader.ExportAsync(request.Criteria, token);
        return value is null ? Result.Failure<MessageLogExport>(Error("ExportLimit", ErrorType.Validation)) : Result.Success(value);
    }
}
public sealed class MessageLogCriteriaValidator : AbstractValidator<MessageLogCriteria>
{
    public MessageLogCriteriaValidator()
    {
        RuleFor(x => x.Page).InclusiveBetween(1, 1000000); RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.Search).MaximumLength(200); RuleFor(x => x.Recipient).MaximumLength(254);
        RuleFor(x => x.Status).Must(x => x is null || MessageLogEntry.IsStatus(x));
        RuleFor(x => x.TemplateId).Must(x => x is null || AccountEmailCatalog.Find(x) is not null);
        RuleFor(x => x.FromUtc).Must(x => !x.HasValue || x.Value.Kind == DateTimeKind.Utc);
        RuleFor(x => x.ToUtc).Must(x => !x.HasValue || x.Value.Kind == DateTimeKind.Utc);
        RuleFor(x => x.ToUtc).Must((x, to) => !to.HasValue || !x.FromUtc.HasValue || to >= x.FromUtc);
    }
}
public sealed class ListMessageLogsValidator : AbstractValidator<ListMessageLogsQuery>
{ public ListMessageLogsValidator() { RuleFor(x => x.Criteria).NotNull().SetValidator(new MessageLogCriteriaValidator()); } }
public sealed class ExportMessageLogsValidator : AbstractValidator<ExportMessageLogsQuery>
{ public ExportMessageLogsValidator() { RuleFor(x => x.Criteria).NotNull().SetValidator(new MessageLogCriteriaValidator()); } }
