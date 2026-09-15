using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;

public interface IStaffingReadStore
{
    Task<PageResponse<EnvelopeAmendmentListItemResponse>> GetAmendmentsAsync(GetEnvelopeAmendmentsQuery query, CancellationToken cancellationToken);
    Task<EnvelopeAmendmentDetailResponse?> GetAmendmentByIdAsync(int id, CancellationToken cancellationToken);
    Task<PageResponse<StaffingRequestListItemResponse>> GetRequestsAsync(GetStaffingRequestsQuery query, CancellationToken cancellationToken);
    Task<StaffingRequestDetailResponse?> GetRequestByIdAsync(int id, CancellationToken cancellationToken);
}

public interface IStaffingWriteStore
{
    void AddAmendment(EnvelopeAmendment amendment);
    void AddRequest(StaffingRequest request);
    Task<EnvelopeAmendment?> GetAmendmentForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<StaffingRequest?> GetRequestForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<PositionEnvelope?> GetEnvelopeForUpdateAsync(int envelopeId, CancellationToken cancellationToken);
    Task<StaffingFiscalYearSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken);
    void ApplyAmendmentRowVersion(EnvelopeAmendment amendment, string rowVersion);
    void ApplyRequestRowVersion(StaffingRequest request, string rowVersion);
}

public sealed record StaffingFiscalYearSnapshot(
    int Id,
    DateOnly StartDate,
    DateOnly EndDate,
    string Status);
