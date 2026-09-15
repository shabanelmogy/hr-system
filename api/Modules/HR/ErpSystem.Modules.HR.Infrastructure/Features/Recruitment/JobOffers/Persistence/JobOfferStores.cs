using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobOffers.Persistence;

public sealed class JobOfferReadStore(
    ApplicationDbContext context,
    TypeAdapterConfig mappingConfig) : IJobOfferReadStore
{
    public async Task<PageResponse<JobOfferDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        int? applicationId,
        JobOfferStatusFilter? status,
        CancellationToken cancellationToken)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, PaginationRequest.MaxPageSize);
        var query = context.JobOffers.AsNoTracking();

        if (applicationId.HasValue)
            query = query.Where(offer => offer.EmploymentApplicationId == applicationId.Value);
        if (status.HasValue)
            query = query.Where(offer => offer.Status == (JobOfferStatus)(int)status.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(offer => offer.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<JobOfferDto>(mappingConfig)
            .ToListAsync(cancellationToken);

        items = await AttachHistoryAsync(items, cancellationToken);
        return new PageResponse<JobOfferDto>(items, new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public async Task<JobOfferDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var item = await context.JobOffers.AsNoTracking()
            .Where(offer => offer.Id == id)
            .ProjectToType<JobOfferDto>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);
        if (item is null)
            return null;

        var history = await context.JobOfferApprovalHistory.AsNoTracking()
            .Where(entry => entry.JobOfferId == id)
            .OrderBy(entry => entry.OccurredOn)
            .Select(entry => new JobOfferApprovalHistoryDto(
                entry.Id,
                entry.Action,
                entry.ActorUserId,
                entry.OccurredOn,
                entry.FromStatus,
                entry.ToStatus,
                entry.Reason))
            .ToListAsync(cancellationToken);

        return item with { ApprovalHistory = history };
    }

    private async Task<List<JobOfferDto>> AttachHistoryAsync(
        List<JobOfferDto> items,
        CancellationToken cancellationToken)
    {
        var offerIds = items.Select(item => item.Id).ToArray();
        if (offerIds.Length == 0)
            return items;

        var histories = await context.JobOfferApprovalHistory.AsNoTracking()
            .Where(entry => offerIds.Contains(entry.JobOfferId))
            .OrderBy(entry => entry.OccurredOn)
            .Select(entry => new
            {
                entry.JobOfferId,
                History = new JobOfferApprovalHistoryDto(
                    entry.Id,
                    entry.Action,
                    entry.ActorUserId,
                    entry.OccurredOn,
                    entry.FromStatus,
                    entry.ToStatus,
                    entry.Reason)
            })
            .ToListAsync(cancellationToken);

        var historyByOffer = histories
            .GroupBy(entry => entry.JobOfferId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<JobOfferApprovalHistoryDto>)group.Select(entry => entry.History).ToList());

        return items.Select(item => item with
        {
            ApprovalHistory = historyByOffer.TryGetValue(item.Id, out var history) ? history : []
        }).ToList();
    }
}

public sealed class JobOfferRepository(ApplicationDbContext context) : IJobOfferRepository
{
    public async Task<JobOfferLineage?> GetLineageAsync(int offerId, CancellationToken cancellationToken)
    {
        var offer = await context.JobOffers.AsNoTracking()
            .Where(item => item.Id == offerId)
            .Select(item => new { item.EmploymentApplicationId })
            .FirstOrDefaultAsync(cancellationToken);
        if (offer is null)
            return null;

        var application = await context.EmploymentApplications.AsNoTracking()
            .Where(item => item.Id == offer.EmploymentApplicationId)
            .Select(item => new { item.JobOpeningId })
            .FirstOrDefaultAsync(cancellationToken);
        var opening = application is null
            ? null
            : await context.JobOpenings.AsNoTracking()
                .Where(item => item.Id == application.JobOpeningId)
                .Select(item => new { item.Id, item.JobRequisitionId })
                .FirstOrDefaultAsync(cancellationToken);
        var requisition = opening is null
            ? null
            : await context.JobRequisitions.AsNoTracking()
                .Where(item => item.Id == opening.JobRequisitionId)
                .Select(item => new { item.Id, item.StaffingRequestId })
                .FirstOrDefaultAsync(cancellationToken);
        var staffing = requisition?.StaffingRequestId is > 0
            ? await context.StaffingRequests.AsNoTracking()
                .Where(item => item.Id == requisition.StaffingRequestId.Value)
                .Select(item => new { item.Id, item.EnvelopeId })
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        return new JobOfferLineage(
            offer.EmploymentApplicationId,
            opening?.Id,
            requisition?.Id,
            staffing?.Id,
            staffing?.EnvelopeId);
    }

    public Task<EmploymentApplication?> GetApplicationSnapshotAsync(int applicationId, CancellationToken cancellationToken) =>
        context.EmploymentApplications.AsNoTracking()
            .FirstOrDefaultAsync(application => application.Id == applicationId, cancellationToken);

    public Task<EmploymentApplication?> GetApplicationForUpdateAsync(int applicationId, CancellationToken cancellationToken) =>
        context.EmploymentApplications
            .Include(application => application.StatusHistory)
            .FirstOrDefaultAsync(application => application.Id == applicationId, cancellationToken);

    public Task<JobOpening?> GetOpeningSnapshotAsync(int openingId, CancellationToken cancellationToken) =>
        context.JobOpenings.AsNoTracking().FirstOrDefaultAsync(opening => opening.Id == openingId, cancellationToken);

    public Task<JobRequisition?> GetRequisitionSnapshotAsync(int requisitionId, CancellationToken cancellationToken) =>
        context.JobRequisitions.AsNoTracking().FirstOrDefaultAsync(requisition => requisition.Id == requisitionId, cancellationToken);

    public Task<StaffingRequest?> GetStaffingRequestSnapshotAsync(int staffingRequestId, CancellationToken cancellationToken) =>
        context.StaffingRequests.AsNoTracking().FirstOrDefaultAsync(request => request.Id == staffingRequestId, cancellationToken);

    public Task<PositionEnvelope?> GetEnvelopeSnapshotAsync(int envelopeId, CancellationToken cancellationToken) =>
        context.PositionEnvelopes.AsNoTracking().FirstOrDefaultAsync(envelope => envelope.Id == envelopeId, cancellationToken);

    public Task<PositionEnvelope?> GetEnvelopeForUpdateAsync(int envelopeId, CancellationToken cancellationToken) =>
        context.PositionEnvelopes.FirstOrDefaultAsync(envelope => envelope.Id == envelopeId, cancellationToken);

    public Task<JobOffer?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.JobOffers.FirstOrDefaultAsync(offer => offer.Id == id, cancellationToken);

    public void Add(JobOffer offer) => context.JobOffers.Add(offer);

    public void AddHistory(JobOfferApprovalHistory history) => context.JobOfferApprovalHistory.Add(history);
}
