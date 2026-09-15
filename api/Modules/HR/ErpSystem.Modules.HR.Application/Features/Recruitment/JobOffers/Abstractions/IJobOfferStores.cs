using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Abstractions;

public sealed record JobOfferLineage(
    int ApplicationId,
    int? OpeningId,
    int? RequisitionId,
    int? StaffingRequestId,
    int? EnvelopeId);

public interface IJobOfferReadStore
{
    Task<PageResponse<JobOfferDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        int? applicationId,
        JobOfferStatusFilter? status,
        CancellationToken cancellationToken);

    Task<JobOfferDto?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public interface IJobOfferRepository
{
    Task<JobOfferLineage?> GetLineageAsync(int offerId, CancellationToken cancellationToken);
    Task<EmploymentApplication?> GetApplicationSnapshotAsync(int applicationId, CancellationToken cancellationToken);
    Task<EmploymentApplication?> GetApplicationForUpdateAsync(int applicationId, CancellationToken cancellationToken);
    Task<JobOpening?> GetOpeningSnapshotAsync(int openingId, CancellationToken cancellationToken);
    Task<JobRequisition?> GetRequisitionSnapshotAsync(int requisitionId, CancellationToken cancellationToken);
    Task<StaffingRequest?> GetStaffingRequestSnapshotAsync(int staffingRequestId, CancellationToken cancellationToken);
    Task<PositionEnvelope?> GetEnvelopeSnapshotAsync(int envelopeId, CancellationToken cancellationToken);
    Task<PositionEnvelope?> GetEnvelopeForUpdateAsync(int envelopeId, CancellationToken cancellationToken);
    Task<JobOffer?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    void Add(JobOffer offer);
    void AddHistory(JobOfferApprovalHistory history);
}
