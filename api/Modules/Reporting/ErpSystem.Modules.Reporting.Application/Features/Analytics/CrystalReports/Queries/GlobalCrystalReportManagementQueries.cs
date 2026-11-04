using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed record GetGlobalCrystalReportEntitiesQuery : IQuery<IReadOnlyList<SupportedCrystalReportEntityResponse>>;
public sealed record DownloadGlobalCrystalReportSchemaQuery(string EntityKey) : IQuery<Result<CrystalReportDownload>>;
public sealed record GetGlobalCrystalReportManagementQuery(string? EntityKey, string? Search, int Page, int PageSize, string? Status = null)
    : IQuery<Result<CrystalReportPageResponse>>;
public sealed record GetGlobalCrystalReportDetailQuery(Guid ReportId) : IQuery<Result<CrystalReportDetailResponse>>;
public sealed record DownloadGlobalCrystalReportVersionQuery(Guid ReportId, Guid VersionId) : IQuery<Result<CrystalReportDownload>>;
public sealed record GetGlobalCrystalReportCandidatesQuery(string EntityKey, string? Search = null, int Page = 1, int PageSize = 10)
    : IQuery<Result<GlobalCrystalReportCandidatePage>>;

public sealed class GetGlobalCrystalReportCandidatesQueryValidator : AbstractValidator<GetGlobalCrystalReportCandidatesQuery>
{
    public GetGlobalCrystalReportCandidatesQueryValidator()
    {
        RuleFor(x => x.EntityKey).NotEmpty().Must(key => key is "countries" or "states" or "districts");
        RuleFor(x => x.Search).MaximumLength(200);
        RuleFor(x => x.Page).InclusiveBetween(1, 100000);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}

public sealed class GetGlobalCrystalReportManagementQueryValidator : AbstractValidator<GetGlobalCrystalReportManagementQuery>
{
    public GetGlobalCrystalReportManagementQueryValidator()
    {
        RuleFor(x => x.Status).Must(status => string.IsNullOrEmpty(status) || status is "published" or "draft" or "archived");
        RuleFor(x => x.EntityKey).Must(key => string.IsNullOrEmpty(key) || key is "countries" or "states" or "districts");
        RuleFor(x => x.Search).MaximumLength(200);
        RuleFor(x => x.Page).InclusiveBetween(1, 100000);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
