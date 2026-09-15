using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Abstractions;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Queries;

public sealed record GetJobPostingsPageQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null,
    JobPostingStatusFilter? Status = null) : IQuery<PageResponse<JobPostingDto>>;

public sealed record GetJobPostingByIdQuery(int Id) : IQuery<Result<JobPostingDto>>;

public sealed class GetJobPostingsPageQueryHandler(IJobPostingReadStore readStore)
    : IQueryHandler<GetJobPostingsPageQuery, PageResponse<JobPostingDto>>
{
    public Task<PageResponse<JobPostingDto>> Handle(
        GetJobPostingsPageQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetPageAsync(
            query.PageNumber,
            query.PageSize,
            query.Search,
            query.Status,
            cancellationToken);
}

public sealed class GetJobPostingByIdQueryHandler(IJobPostingReadStore readStore)
    : IQueryHandler<GetJobPostingByIdQuery, Result<JobPostingDto>>
{
    public async Task<Result<JobPostingDto>> Handle(
        GetJobPostingByIdQuery query,
        CancellationToken cancellationToken)
    {
        var posting = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return posting is not null
            ? Result.Success(posting)
            : Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);
    }
}
