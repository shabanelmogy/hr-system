using System.Text.Json.Serialization;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using FluentValidation;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;

public sealed record ErrorLogCriteria(
    DateTime? FromUtc = null, DateTime? ToUtc = null, string? UserName = null,
    string? Source = null, int? StatusCode = null, string? Search = null,
    int Page = 1, int PageSize = 25);

public sealed record ErrorLogRow(Guid Id, DateTime OccurredOnUtc, string Source, string Severity,
    string? UserName, string? Service, string? Action, int? StatusCode, long? DurationMs,
    string? CorrelationId, string Summary, string? Client, string? Browser, string? IpAddress);
public sealed record ErrorLogPage(IReadOnlyList<ErrorLogRow> Items, int TotalCount, int Page, int PageSize);
public sealed record ErrorLogDetail(ErrorLogRow Entry, IReadOnlyList<string> Diagnostics);
public sealed record ErrorLogSettingsResponse(int RetentionDays, long Revision, int QueueDepth,
    long DroppedCount, long FailedWrites);
public sealed record UpdateErrorLogSettingsRequest(int RetentionDays, long ExpectedRevision);
public sealed record ErrorLogExport(byte[] Contents, string FileName);

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record ClientErrorLogReport(string Source, string Kind, string ErrorType, Guid EventId);

public interface IErrorLogStore
{
    Task<bool> HasCompanyScopeAsync(string? userId, string? tenantId, int? companyId, CancellationToken token);
    Task<ErrorLogPage> ListAsync(ErrorLogCriteria criteria, bool system, string? tenantId, int? companyId, CancellationToken token);
    Task<ErrorLogDetail?> DetailAsync(Guid id, bool system, string? tenantId, int? companyId, CancellationToken token);
    Task<ErrorLogExport?> ExportAsync(ErrorLogCriteria criteria, bool system, string? tenantId, int? companyId, CancellationToken token);
    Task<ErrorLogSettingsResponse> GetSettingsAsync(CancellationToken token);
    Task<ErrorLogSettingsResponse?> UpdateSettingsAsync(int days, long expectedRevision, string? actorUserId, CancellationToken token);
}

public sealed record ListErrorLogsQuery(ErrorLogCriteria Criteria, bool System) : IQuery<Result<ErrorLogPage>>;
public sealed record GetErrorLogDetailQuery(Guid Id, bool System) : IQuery<Result<ErrorLogDetail>>;
public sealed record ExportErrorLogsQuery(ErrorLogCriteria Criteria, bool System) : IQuery<Result<ErrorLogExport>>;
public sealed record GetErrorLogSettingsQuery : IQuery<Result<ErrorLogSettingsResponse>>;
public sealed record UpdateErrorLogSettingsCommand(UpdateErrorLogSettingsRequest Request) : ICommand<Result<ErrorLogSettingsResponse>>;
public sealed record ReportClientErrorCommand(ClientErrorLogReport Report) : ICommand<Result>;

public sealed class ErrorLogRequestHandler(IErrorLogStore store, ICurrentExecutionContext actor,
    IErrorLogCaptureSink capture, TimeProvider clock, IStringLocalizer<ErrorLogRequestHandler> localizer) :
    IQueryHandler<ListErrorLogsQuery, Result<ErrorLogPage>>,
    IQueryHandler<GetErrorLogDetailQuery, Result<ErrorLogDetail>>,
    IQueryHandler<ExportErrorLogsQuery, Result<ErrorLogExport>>,
    IQueryHandler<GetErrorLogSettingsQuery, Result<ErrorLogSettingsResponse>>,
    ICommandHandler<UpdateErrorLogSettingsCommand, Result<ErrorLogSettingsResponse>>,
    ICommandHandler<ReportClientErrorCommand, Result>
{
    private Error Invalid => new("ErrorLogs.Invalid", localizer["ErrorLogs.Invalid"], ErrorType.Validation);
    private Error Forbidden => new("ErrorLogs.Forbidden", localizer["ErrorLogs.Forbidden"], ErrorType.Forbidden);
    private Error Missing => new("ErrorLogs.NotFound", localizer["ErrorLogs.NotFound"], ErrorType.NotFound);
    private Error Conflict => new("ErrorLogs.Conflict", localizer["ErrorLogs.Conflict"], ErrorType.Conflict);

    private bool HasSystemScope => actor.IsInRole(PlatformRoleNames.SuperAdmin);
    private async Task<bool> HasScope(bool system, CancellationToken token) =>
        system ? HasSystemScope : !HasSystemScope && await store.HasCompanyScopeAsync(actor.UserId, actor.TenantId, actor.CompanyId, token);

    public async Task<Result<ErrorLogPage>> Handle(ListErrorLogsQuery request, CancellationToken token)
    {
        if (!Valid(request.Criteria)) return Result.Failure<ErrorLogPage>(Invalid);
        if (!await HasScope(request.System, token)) return Result.Failure<ErrorLogPage>(Forbidden);
        return Result.Success(await store.ListAsync(request.Criteria, request.System, actor.TenantId, actor.CompanyId, token));
    }
    public async Task<Result<ErrorLogDetail>> Handle(GetErrorLogDetailQuery request, CancellationToken token)
    {
        if (!await HasScope(request.System, token)) return Result.Failure<ErrorLogDetail>(Forbidden);
        var detail = await store.DetailAsync(request.Id, request.System, actor.TenantId, actor.CompanyId, token);
        return detail is null ? Result.Failure<ErrorLogDetail>(Missing) : Result.Success(detail);
    }
    public async Task<Result<ErrorLogExport>> Handle(ExportErrorLogsQuery request, CancellationToken token)
    {
        if (!Valid(request.Criteria)) return Result.Failure<ErrorLogExport>(Invalid);
        if (!await HasScope(request.System, token)) return Result.Failure<ErrorLogExport>(Forbidden);
        var export = await store.ExportAsync(request.Criteria, request.System, actor.TenantId, actor.CompanyId, token);
        return export is null ? Result.Failure<ErrorLogExport>(Invalid) : Result.Success(export);
    }
    public async Task<Result<ErrorLogSettingsResponse>> Handle(GetErrorLogSettingsQuery request, CancellationToken token) =>
        HasSystemScope ? Result.Success(await store.GetSettingsAsync(token)) : Result.Failure<ErrorLogSettingsResponse>(Forbidden);
    public async Task<Result<ErrorLogSettingsResponse>> Handle(UpdateErrorLogSettingsCommand request, CancellationToken token)
    {
        if (!HasSystemScope) return Result.Failure<ErrorLogSettingsResponse>(Forbidden);
        if (request.Request.RetentionDays is < 1 or > 3650 || request.Request.ExpectedRevision < 0)
            return Result.Failure<ErrorLogSettingsResponse>(Invalid);
        var value = await store.UpdateSettingsAsync(request.Request.RetentionDays, request.Request.ExpectedRevision, actor.UserId, token);
        return value is null ? Result.Failure<ErrorLogSettingsResponse>(Conflict) : Result.Success(value);
    }
    public async Task<Result> Handle(ReportClientErrorCommand request, CancellationToken token)
    {
        var report = request.Report;
        if (report is null || report.EventId == Guid.Empty || report.Source is not ("web" or "mobile") ||
            report.Kind is not ("runtime" or "network" or "boundary" or "rejection") ||
            report.ErrorType is not ("Error" or "TypeError" or "ReferenceError" or "RangeError" or "SyntaxError" or "NetworkError" or "unknown"))
            return Result.Failure(Invalid);
        if (!HasSystemScope && !await store.HasCompanyScopeAsync(actor.UserId, actor.TenantId, actor.CompanyId, token))
            return Result.Failure(Forbidden);
        var userId = actor.UserId;
        if (string.IsNullOrWhiteSpace(userId)) return Result.Failure(Forbidden);
        capture.TryCapture(new ErrorLogCapture(report.EventId, clock.GetUtcNow(),
            report.Source == "web" ? ErrorLogSource.Web : ErrorLogSource.Mobile,
            ErrorLogSeverity.Error, null, userId, actor.TenantId, actor.CompanyId,
            report.Kind, report.ErrorType, null, actor.CorrelationId, "ClientError", null, null, null));
        return Result.Success();
    }

    private static bool Valid(ErrorLogCriteria query) => query.Page is >= 1 and <= 100000 &&
        query.PageSize is >= 1 and <= 100 && (query.Search?.Length ?? 0) <= 120 &&
        (query.UserName?.Length ?? 0) <= 100 && query.Source is null or "api" or "job" or "web" or "mobile" &&
        query.StatusCode is null or >= 400 and <= 599 &&
        (!query.FromUtc.HasValue || query.FromUtc.Value.Kind == DateTimeKind.Utc) &&
        (!query.ToUtc.HasValue || query.ToUtc.Value.Kind == DateTimeKind.Utc) &&
        (!query.FromUtc.HasValue || !query.ToUtc.HasValue || query.FromUtc <= query.ToUtc);
}

public sealed class ListErrorLogsQueryValidator : AbstractValidator<ListErrorLogsQuery>
{
    public ListErrorLogsQueryValidator()
    {
        RuleFor(x => x.Criteria).NotNull();
        When(x => x.Criteria is not null, () =>
        {
            RuleFor(x => x.Criteria.Page).InclusiveBetween(1, 100000);
            RuleFor(x => x.Criteria.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.Criteria.Search).MaximumLength(120);
            RuleFor(x => x.Criteria.UserName).MaximumLength(100);
            RuleFor(x => x.Criteria.Source).Must(x => x is null or "api" or "job" or "web" or "mobile");
            RuleFor(x => x.Criteria.StatusCode).Must(x => x is null or >= 400 and <= 599);
            RuleFor(x => x.Criteria).Must(x => !x.FromUtc.HasValue || !x.ToUtc.HasValue || x.FromUtc <= x.ToUtc);
        });
    }
}

public sealed class UpdateErrorLogSettingsCommandValidator : AbstractValidator<UpdateErrorLogSettingsCommand>
{
    public UpdateErrorLogSettingsCommandValidator()
    {
        RuleFor(x => x.Request).NotNull();
        When(x => x.Request is not null, () =>
        {
            RuleFor(x => x.Request.RetentionDays).InclusiveBetween(1, 3650);
            RuleFor(x => x.Request.ExpectedRevision).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed class ReportClientErrorCommandValidator : AbstractValidator<ReportClientErrorCommand>
{
    public ReportClientErrorCommandValidator()
    {
        RuleFor(x => x.Report).NotNull();
        When(x => x.Report is not null, () =>
        {
            RuleFor(x => x.Report.EventId).NotEmpty();
            RuleFor(x => x.Report.Source).Must(x => x is "web" or "mobile");
            RuleFor(x => x.Report.Kind).Must(x => x is "runtime" or "network" or "boundary" or "rejection");
            RuleFor(x => x.Report.ErrorType).Must(x => x is "Error" or "TypeError" or "ReferenceError" or "RangeError" or "SyntaxError" or "NetworkError" or "unknown");
        });
    }
}
