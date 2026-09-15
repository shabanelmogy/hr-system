using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Abstractions;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Queries;

public sealed record GetJobOpeningsPageQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null,
    JobOpeningStatusFilter? Status = null,
    int? DepartmentId = null) : IQuery<PageResponse<JobOpeningDto>>;

public sealed record GetJobOpeningByIdQuery(int Id) : IQuery<Result<JobOpeningDto>>;

public sealed class GetJobOpeningsPageQueryHandler(IJobOpeningReadStore readStore)
    : IQueryHandler<GetJobOpeningsPageQuery, PageResponse<JobOpeningDto>>
{
    public Task<PageResponse<JobOpeningDto>> Handle(
        GetJobOpeningsPageQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetPageAsync(
            query.PageNumber,
            query.PageSize,
            query.Search,
            query.Status,
            query.DepartmentId,
            cancellationToken);
}

public sealed class GetJobOpeningByIdQueryHandler(IJobOpeningReadStore readStore)
    : IQueryHandler<GetJobOpeningByIdQuery, Result<JobOpeningDto>>
{
    public async Task<Result<JobOpeningDto>> Handle(
        GetJobOpeningByIdQuery query,
        CancellationToken cancellationToken)
    {
        var opening = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return opening is not null
            ? Result.Success(opening)
            : Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);
    }
}
