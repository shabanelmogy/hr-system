using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Abstractions;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Queries;

public sealed record GetJobOffersPageQuery(
    int PageNumber = 1,
    int PageSize = 10,
    int? ApplicationId = null,
    JobOfferStatusFilter? Status = null)
    : IQuery<PageResponse<JobOfferDto>>;

public sealed record GetJobOfferByIdQuery(int Id) : IQuery<Result<JobOfferDto>>;

public sealed class GetJobOffersPageQueryHandler(IJobOfferReadStore readStore)
    : IQueryHandler<GetJobOffersPageQuery, PageResponse<JobOfferDto>>
{
    public Task<PageResponse<JobOfferDto>> Handle(GetJobOffersPageQuery query, CancellationToken cancellationToken) =>
        readStore.GetPageAsync(query.PageNumber, query.PageSize, query.ApplicationId, query.Status, cancellationToken);
}

public sealed class GetJobOfferByIdQueryHandler(IJobOfferReadStore readStore)
    : IQueryHandler<GetJobOfferByIdQuery, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(GetJobOfferByIdQuery query, CancellationToken cancellationToken)
    {
        var offer = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return offer is not null
            ? Result.Success(offer)
            : Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);
    }
}
