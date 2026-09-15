using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Queries;

public sealed record GetCandidatesPageQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null) : IQuery<PageResponse<CandidateDto>>;

public sealed record GetCandidateByIdQuery(int Id) : IQuery<Result<CandidateDto>>;

public sealed class GetCandidatesPageQueryHandler(ICandidateReadStore readStore)
    : IQueryHandler<GetCandidatesPageQuery, PageResponse<CandidateDto>>
{
    public Task<PageResponse<CandidateDto>> Handle(
        GetCandidatesPageQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetPageAsync(query.PageNumber, query.PageSize, query.Search, cancellationToken);
}

public sealed class GetCandidateByIdQueryHandler(ICandidateReadStore readStore)
    : IQueryHandler<GetCandidateByIdQuery, Result<CandidateDto>>
{
    public async Task<Result<CandidateDto>> Handle(
        GetCandidateByIdQuery query,
        CancellationToken cancellationToken)
    {
        var candidate = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return candidate is not null
            ? Result.Success(candidate)
            : Result.Failure<CandidateDto>(RecruitmentErrors.CandidateNotFound);
    }
}
