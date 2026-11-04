using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed record GetGlobalCrystalReportDatabaseViewsQuery(string SourceKey, string? Search = null,
    int Page = 1, int PageSize = 20) : IQuery<Result<CrystalReportDatabaseViewPage>>;

public sealed class GetGlobalCrystalReportDatabaseViewsQueryValidator : AbstractValidator<GetGlobalCrystalReportDatabaseViewsQuery>
{
    public GetGlobalCrystalReportDatabaseViewsQueryValidator()
    {
        RuleFor(request => request.SourceKey).NotEmpty().MaximumLength(64);
        RuleFor(request => request.Search).MaximumLength(200);
        RuleFor(request => request.Page).InclusiveBetween(1, 100000);
        RuleFor(request => request.PageSize).InclusiveBetween(1, 50);
    }
}

public sealed class GetGlobalCrystalReportDatabaseViewsQueryHandler(GlobalCrystalReportPolicy policy,
    IGlobalCrystalReportViewCatalog views, CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportDatabaseViewsQuery, Result<CrystalReportDatabaseViewPage>>
{
    public async Task<Result<CrystalReportDatabaseViewPage>> Handle(GetGlobalCrystalReportDatabaseViewsQuery request,
        CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.SourceKey, ReportingPermissions.CreateGlobalCrystalReports))
            return Result.Failure<CrystalReportDatabaseViewPage>(errors.GlobalCrystalReportForbidden);
        var result = await views.ListAsync(request.SourceKey, request.Search, Math.Clamp(request.Page, 1, 100000),
            Math.Clamp(request.PageSize, 1, 50), cancellationToken);
        return result is null ? Result.Failure<CrystalReportDatabaseViewPage>(errors.CrystalReportViewCatalogUnavailable)
            : Result.Success(result);
    }
}
