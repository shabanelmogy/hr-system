using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;

public sealed class StaffingReadStore(ApplicationDbContext context) : IStaffingReadStore
{
    public async Task<PageResponse<EnvelopeAmendmentListItemResponse>> GetAmendmentsAsync(
        GetEnvelopeAmendmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.EnvelopeAmendments.AsNoTracking().Where(item => !item.IsDeleted);
        if (request.EnvelopeId.HasValue)
            query = query.Where(item => item.EnvelopeId == request.EnvelopeId.Value);
        if (!request.Status.Equals("all", StringComparison.OrdinalIgnoreCase) &&
            Enum.TryParse<EnvelopeAmendmentStatus>(request.Status, true, out var status))
            query = query.Where(item => item.Status == status);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(item => item.Justification.Contains(search) ||
                context.PositionEnvelopes.Any(envelope => envelope.Id == item.EnvelopeId && envelope.EnvelopeCode.Contains(search)));
        }

        query = request.SortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase)
            ? query.OrderBy(item => item.CreatedOn).ThenBy(item => item.Id)
            : query.OrderByDescending(item => item.CreatedOn).ThenByDescending(item => item.Id);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(item => new EnvelopeAmendmentListItemResponse(
                item.Id,
                item.EnvelopeId,
                context.PositionEnvelopes.Where(envelope => envelope.Id == item.EnvelopeId).Select(envelope => envelope.EnvelopeCode).First(),
                item.AdditionalHeadcount,
                item.AdditionalSalaryCost,
                item.Status,
                item.CreatedOn,
                item.UpdatedOn,
                Convert.ToBase64String(item.RowVersion)))
            .ToListAsync(cancellationToken);
        var page = new PagedList<EnvelopeAmendmentListItemResponse>(items, total, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<EnvelopeAmendmentListItemResponse>(page, page.MetaData);
    }

    public async Task<EnvelopeAmendmentDetailResponse?> GetAmendmentByIdAsync(int id, CancellationToken cancellationToken)
    {
        var item = await context.EnvelopeAmendments.AsNoTracking()
            .Where(amendment => amendment.Id == id && !amendment.IsDeleted)
            .Select(amendment => new EnvelopeAmendmentDetailResponse(
                amendment.Id,
                amendment.EnvelopeId,
                context.PositionEnvelopes.Where(envelope => envelope.Id == amendment.EnvelopeId).Select(envelope => envelope.EnvelopeCode).First(),
                amendment.AdditionalHeadcount,
                amendment.AdditionalSalaryCost,
                amendment.Justification,
                amendment.Status,
                amendment.RequestedById,
                amendment.SubmittedOn,
                amendment.SubmittedById,
                amendment.ApprovedOn,
                amendment.ApprovedById,
                amendment.RejectedOn,
                amendment.RejectedById,
                amendment.DecisionReason,
                amendment.CreatedOn,
                amendment.UpdatedOn,
                Convert.ToBase64String(amendment.RowVersion)))
            .FirstOrDefaultAsync(cancellationToken);
        return item;
    }

    public async Task<PageResponse<StaffingRequestListItemResponse>> GetRequestsAsync(
        GetStaffingRequestsQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.StaffingRequests.AsNoTracking().Where(item => !item.IsDeleted);
        if (request.EnvelopeId.HasValue)
            query = query.Where(item => item.EnvelopeId == request.EnvelopeId.Value);
        if (request.FiscalYearId.HasValue)
            query = query.Where(item => context.PositionEnvelopes.Any(envelope =>
                envelope.Id == item.EnvelopeId && envelope.FiscalYearId == request.FiscalYearId.Value));
        if (!request.Status.Equals("all", StringComparison.OrdinalIgnoreCase) &&
            Enum.TryParse<StaffingRequestStatus>(request.Status, true, out var status))
            query = query.Where(item => item.Status == status);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(item => item.Justification.Contains(search) ||
                context.PositionEnvelopes.Any(envelope => envelope.Id == item.EnvelopeId && envelope.EnvelopeCode.Contains(search)));
        }

        var ascending = request.SortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase);
        query = (request.SortBy.ToUpperInvariant(), ascending) switch
        {
            ("TARGETSTARTDATE", true) => query.OrderBy(item => item.TargetStartDate).ThenBy(item => item.Id),
            ("TARGETSTARTDATE", false) => query.OrderByDescending(item => item.TargetStartDate).ThenByDescending(item => item.Id),
            ("CREATEDON", true) => query.OrderBy(item => item.CreatedOn).ThenBy(item => item.Id),
            _ => query.OrderByDescending(item => item.CreatedOn).ThenByDescending(item => item.Id)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(item => new StaffingRequestListItemResponse(
                item.Id,
                item.EnvelopeId,
                context.PositionEnvelopes.Where(envelope => envelope.Id == item.EnvelopeId).Select(envelope => envelope.EnvelopeCode).First(),
                item.RequestedHeadcount,
                item.EstimatedAnnualSalaryPerSlot,
                item.EstimatedFiscalYearCostPerSlot,
                item.TotalReservedCost,
                item.TargetStartDate,
                item.RequestType,
                item.Priority,
                item.Status,
                item.RequestedHeadcount - item.AllocatedRequisitionPositions,
                item.RequestedHeadcount - item.HiredPositions,
                item.CreatedOn,
                Convert.ToBase64String(item.RowVersion)))
            .ToListAsync(cancellationToken);
        var page = new PagedList<StaffingRequestListItemResponse>(items, total, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<StaffingRequestListItemResponse>(page, page.MetaData);
    }

    public Task<StaffingRequestDetailResponse?> GetRequestByIdAsync(int id, CancellationToken cancellationToken) =>
        context.StaffingRequests.AsNoTracking()
            .Where(item => item.Id == id && !item.IsDeleted)
            .Select(item => new StaffingRequestDetailResponse(
                item.Id,
                item.EnvelopeId,
                context.PositionEnvelopes.Where(envelope => envelope.Id == item.EnvelopeId).Select(envelope => envelope.EnvelopeCode).First(),
                item.RequestedHeadcount,
                item.EstimatedAnnualSalaryPerSlot,
                item.EstimatedFiscalYearCostPerSlot,
                item.TotalReservedCost,
                item.TargetStartDate,
                item.RequestType,
                item.Priority,
                item.Justification,
                item.CurrencyCode,
                item.CalculationPolicyVersion,
                item.AllocatedRequisitionPositions,
                item.HiredPositions,
                item.RequestedHeadcount - item.AllocatedRequisitionPositions,
                item.RequestedHeadcount - item.HiredPositions,
                item.Status,
                item.CloseReason,
                item.SubmittedOn,
                item.SubmittedById,
                item.ApprovedOn,
                item.ApprovedById,
                item.RejectedOn,
                item.RejectedById,
                item.DecisionReason,
                item.ClosedOn,
                item.CreatedOn,
                item.UpdatedOn,
                Convert.ToBase64String(item.RowVersion)))
            .FirstOrDefaultAsync(cancellationToken);
}

public sealed class StaffingWriteStore(
    ApplicationDbContext context,
    IFiscalYearPlanningSource fiscalYears,
    ICurrentActor currentActor) : IStaffingWriteStore
{
    public void AddAmendment(EnvelopeAmendment amendment) => context.EnvelopeAmendments.Add(amendment);

    public void AddRequest(StaffingRequest request) => context.StaffingRequests.Add(request);

    public Task<EnvelopeAmendment?> GetAmendmentForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.EnvelopeAmendments.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

    public Task<StaffingRequest?> GetRequestForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.StaffingRequests.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

    public Task<PositionEnvelope?> GetEnvelopeForUpdateAsync(int envelopeId, CancellationToken cancellationToken) =>
        context.PositionEnvelopes.FirstOrDefaultAsync(item => item.Id == envelopeId, cancellationToken);

    public async Task<StaffingFiscalYearSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentActor.TenantId) || currentActor.CompanyId is not > 0)
            return null;

        var item = await fiscalYears.GetAsync(currentActor.TenantId, currentActor.CompanyId.Value, fiscalYearId, cancellationToken);
        return item is null ? null : new StaffingFiscalYearSnapshot(item.Id, item.StartDate, item.EndDate, item.Status);
    }

    public void ApplyAmendmentRowVersion(EnvelopeAmendment amendment, string rowVersion) =>
        context.Entry(amendment).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(rowVersion);

    public void ApplyRequestRowVersion(StaffingRequest request, string rowVersion) =>
        context.Entry(request).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(rowVersion);
}
