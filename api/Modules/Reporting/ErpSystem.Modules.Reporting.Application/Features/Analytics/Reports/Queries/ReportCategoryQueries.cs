using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Errors;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Queries;

public sealed record GetReportCategoriesQuery : IQuery<IReadOnlyList<ReportCategoryResponse>>;
public sealed record GetReportCategoryByIdQuery(int Id) : IQuery<Result<ReportCategoryResponse>>;

public sealed class GetReportCategoriesQueryHandler(IReportCategoryReadStore readStore)
    : IQueryHandler<GetReportCategoriesQuery, IReadOnlyList<ReportCategoryResponse>>
{
    public Task<IReadOnlyList<ReportCategoryResponse>> Handle(
        GetReportCategoriesQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetAllAsync(cancellationToken);
}

public sealed class GetReportCategoryByIdQueryHandler(
    IReportCategoryReadStore readStore,
    ReportCategoryErrors errors)
    : IQueryHandler<GetReportCategoryByIdQuery, Result<ReportCategoryResponse>>
{
    public async Task<Result<ReportCategoryResponse>> Handle(
        GetReportCategoryByIdQuery query,
        CancellationToken cancellationToken)
    {
        var response = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return response is not null
            ? Result.Success(response)
            : Result.Failure<ReportCategoryResponse>(errors.ReportCategoryNotFound);
    }
}
