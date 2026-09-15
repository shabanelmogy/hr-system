using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Abstractions;

public sealed record RecruitmentHireLineage(
    int? OfferId,
    int? OpeningId,
    int? RequisitionId,
    int? StaffingRequestId,
    int? EnvelopeId);

public interface IEmploymentApplicationReadStore
{
    Task<PageResponse<EmploymentApplicationDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        int? jobOpeningId,
        ApplicationStatusFilter? status,
        CancellationToken cancellationToken);

    Task<EmploymentApplicationDto?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public interface IEmploymentApplicationRepository
{
    Task<JobOpeningStatus?> GetOpeningStatusAsync(int id, CancellationToken cancellationToken);
    Task<bool> CandidateExistsAsync(int id, CancellationToken cancellationToken);
    void Add(EmploymentApplication application);
    Task<EmploymentApplication?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IRecruitmentHireRepository
{
    Task<ApplicationStatus?> GetApplicationStatusAsync(int applicationId, CancellationToken cancellationToken);
    Task<RecruitmentHireLineage?> GetLineageAsync(int applicationId, CancellationToken cancellationToken);
    Task<EmploymentApplication?> FindByHireIdempotencyKeyAsync(string key, CancellationToken cancellationToken);
    Task<EmploymentApplication?> GetApplicationForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<JobOffer?> GetAcceptedOfferAsync(int applicationId, CancellationToken cancellationToken);
    Task<Candidate?> GetCandidateAsync(int candidateId, CancellationToken cancellationToken);
    Task<JobOpening?> GetOpeningAsync(int openingId, CancellationToken cancellationToken);
    Task<JobRequisition?> GetRequisitionAsync(int requisitionId, CancellationToken cancellationToken);
    Task<StaffingRequest?> GetStaffingRequestAsync(int staffingRequestId, CancellationToken cancellationToken);
    Task<PositionEnvelope?> GetEnvelopeAsync(int envelopeId, CancellationToken cancellationToken);
    Task<Employee?> GetEmployeeByNumberAsync(string employeeNumber, CancellationToken cancellationToken);
    void AddEmployee(Employee employee);
}
