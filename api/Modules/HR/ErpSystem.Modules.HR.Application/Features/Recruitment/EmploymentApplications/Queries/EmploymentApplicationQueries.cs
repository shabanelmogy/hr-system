using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Queries;

public sealed record GetEmploymentApplicationsPageQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null,
    int? JobOpeningId = null,
    ApplicationStatusFilter? Status = null)
    : IQuery<PageResponse<EmploymentApplicationDto>>;

public sealed record GetEmploymentApplicationByIdQuery(int Id)
    : IQuery<Result<EmploymentApplicationDto>>;

public sealed class GetEmploymentApplicationsPageQueryHandler(IEmploymentApplicationReadStore readStore)
    : IQueryHandler<GetEmploymentApplicationsPageQuery, PageResponse<EmploymentApplicationDto>>
{
    public Task<PageResponse<EmploymentApplicationDto>> Handle(
        GetEmploymentApplicationsPageQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetPageAsync(
            query.PageNumber,
            query.PageSize,
            query.Search,
            query.JobOpeningId,
            query.Status,
            cancellationToken);
}

public sealed class GetEmploymentApplicationByIdQueryHandler(IEmploymentApplicationReadStore readStore)
    : IQueryHandler<GetEmploymentApplicationByIdQuery, Result<EmploymentApplicationDto>>
{
    public async Task<Result<EmploymentApplicationDto>> Handle(
        GetEmploymentApplicationByIdQuery query,
        CancellationToken cancellationToken)
    {
        var application = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return application is not null
            ? Result.Success(application)
            : Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.EmploymentApplicationNotFound);
    }
}
