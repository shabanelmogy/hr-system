using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed record GetPublishedCrystalReportsQuery(string? EntityKey, string? Search)
    : IQuery<IReadOnlyList<CrystalReportListItemResponse>>;

public sealed record GetGlobalCrystalReportsQuery(string EntityKey)
    : IQuery<Result<IReadOnlyList<GlobalCrystalReportListItemResponse>>>;

public sealed record RenderGlobalCrystalReportQuery(
    string SourceId,
    string EntityKey,
    string ExpectedSha256,
    string Language,
    IReadOnlyDictionary<string, string?>? Filters)
    : IQuery<Result<CrystalReportDownload>>;

public sealed record GetCrystalReportsManagementQuery(
    string? EntityKey, string? Search, string? Status, int Page, int PageSize)
    : IQuery<CrystalReportPageResponse>;

public sealed record GetCrystalReportDetailQuery(Guid ReportId)
    : IQuery<Result<CrystalReportDetailResponse>>;

public sealed record GetCrystalReportVersionsQuery(Guid ReportId)
    : IQuery<Result<IReadOnlyList<CrystalReportVersionResponse>>>;

public sealed record GetCrystalReportGrantsQuery(Guid ReportId)
    : IQuery<Result<IReadOnlyList<CrystalReportRoleGrantResponse>>>;

public sealed record GetCrystalReportGrantRoleOptionsQuery
    : IQuery<IReadOnlyList<CrystalReportRoleOptionResponse>>;

public sealed record DownloadCrystalReportQuery(Guid ReportId, Guid? VersionId)
    : IQuery<Result<CrystalReportDownload>>;

public sealed record RenderCrystalReportQuery(
    Guid ReportId,
    string Language,
    IReadOnlyDictionary<string, string?>? Filters)
    : IQuery<Result<CrystalReportDownload>>;

public sealed record GetDiscoveredCrystalReportsQuery(string? EntityKey)
    : IQuery<Result<IReadOnlyList<DiscoveredCrystalReportResponse>>>;

public sealed class GetPublishedCrystalReportsQueryValidator : AbstractValidator<GetPublishedCrystalReportsQuery>
{
    public GetPublishedCrystalReportsQueryValidator()
    {
        RuleFor(x => x.EntityKey).MaximumLength(64)
            .Must(value => value is null || CrystalReportRules.IsValidKey(value));
        RuleFor(x => x.Search).MaximumLength(150);
    }
}

public sealed class GetCrystalReportsManagementQueryValidator : AbstractValidator<GetCrystalReportsManagementQuery>
{
    public GetCrystalReportsManagementQueryValidator()
    {
        RuleFor(x => x.EntityKey).MaximumLength(64)
            .Must(value => value is null || CrystalReportRules.IsValidKey(value));
        RuleFor(x => x.Search).MaximumLength(150);
        RuleFor(x => x.Status)
            .Must(value => value is null or "published" or "draft" or "archived")
            .WithMessage("Status must be published, draft, or archived.");
        RuleFor(x => x.Page).InclusiveBetween(1, int.MaxValue);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);
    }
}

public sealed class GetDiscoveredCrystalReportsQueryValidator
    : AbstractValidator<GetDiscoveredCrystalReportsQuery>
{
    public GetDiscoveredCrystalReportsQueryValidator()
    {
        RuleFor(x => x.EntityKey).MaximumLength(64)
            .Must(value => value is null || CrystalReportRules.IsValidKey(value));
    }
}

public sealed class RenderCrystalReportQueryValidator : AbstractValidator<RenderCrystalReportQuery>
{
    public RenderCrystalReportQueryValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.Language)
            .Must(value => value is "ar" or "en")
            .WithMessage("Language must be ar or en.");
        RuleFor(x => x.Filters)
            .Must(AreValidFilters)
            .WithMessage("Report filters must contain at most 16 safe keys with values up to 200 characters.");
    }

    internal static bool AreValidFilters(IReadOnlyDictionary<string, string?>? filters)
    {
        if (filters is null)
            return true;
        if (filters.Count > 16)
            return false;

        return filters.All(item =>
            CrystalReportRules.IsValidKey(item.Key) &&
            (item.Value is null || item.Value.Length <= 200));
    }
}

public sealed class GetGlobalCrystalReportsQueryValidator
    : AbstractValidator<GetGlobalCrystalReportsQuery>
{
    public GetGlobalCrystalReportsQueryValidator()
    {
        RuleFor(x => x.EntityKey)
            .NotEmpty()
            .MaximumLength(64)
            .Must(CrystalReportRules.IsValidKey);
    }
}

public sealed class RenderGlobalCrystalReportQueryValidator
    : AbstractValidator<RenderGlobalCrystalReportQuery>
{
    public RenderGlobalCrystalReportQueryValidator()
    {
        RuleFor(x => x.SourceId).Matches("^[0-9a-f]{64}$");
        RuleFor(x => x.EntityKey)
            .NotEmpty()
            .MaximumLength(64)
            .Must(CrystalReportRules.IsValidKey);
        RuleFor(x => x.ExpectedSha256).Matches("^[0-9a-f]{64}$");
        RuleFor(x => x.Language)
            .Must(value => value is "ar" or "en")
            .WithMessage("Language must be ar or en.");
        RuleFor(x => x.Filters)
            .Must(RenderCrystalReportQueryValidator.AreValidFilters)
            .WithMessage("Report filters must contain at most 16 safe keys with values up to 200 characters.");
    }
}
