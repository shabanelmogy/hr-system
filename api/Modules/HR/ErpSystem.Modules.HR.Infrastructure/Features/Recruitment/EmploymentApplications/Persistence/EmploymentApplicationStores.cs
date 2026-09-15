using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Abstractions;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.EmploymentApplications.Persistence;

public sealed class EmploymentApplicationReadStore(
    ApplicationDbContext context,
    TypeAdapterConfig mappingConfig) : IEmploymentApplicationReadStore
{
    public async Task<PageResponse<EmploymentApplicationDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        int? jobOpeningId,
        ApplicationStatusFilter? status,
        CancellationToken cancellationToken)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, PaginationRequest.MaxPageSize);
        var query = context.EmploymentApplications.AsNoTracking();

        if (jobOpeningId.HasValue)
            query = query.Where(application => application.JobOpeningId == jobOpeningId.Value);
        if (status.HasValue)
            query = query.Where(application => application.Status == (ApplicationStatus)(int)status.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(application =>
                application.Candidate.FirstName.ToLower().Contains(term) ||
                application.Candidate.LastName.ToLower().Contains(term) ||
                application.Candidate.Email.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(application => application.LastStatusChangedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<EmploymentApplicationDto>(mappingConfig)
            .ToListAsync(cancellationToken);
        items = items.Select(NormalizeAverageEvaluationScore).ToList();
        return new PageResponse<EmploymentApplicationDto>(items, new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public async Task<EmploymentApplicationDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var item = await context.EmploymentApplications.AsNoTracking()
            .Where(application => application.Id == id)
            .ProjectToType<EmploymentApplicationDto>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);
        return item is null ? null : NormalizeAverageEvaluationScore(item);
    }

    private static EmploymentApplicationDto NormalizeAverageEvaluationScore(EmploymentApplicationDto item) =>
        item.AverageEvaluationScore.HasValue
            ? item with { AverageEvaluationScore = Math.Round(item.AverageEvaluationScore.Value, 1) }
            : item;
}

public sealed class EmploymentApplicationRepository(ApplicationDbContext context) : IEmploymentApplicationRepository
{
    public Task<JobOpeningStatus?> GetOpeningStatusAsync(int id, CancellationToken cancellationToken) =>
        context.JobOpenings.AsNoTracking()
            .Where(opening => opening.Id == id)
            .Select(opening => (JobOpeningStatus?)opening.Status)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<bool> CandidateExistsAsync(int id, CancellationToken cancellationToken) =>
        context.Candidates.AsNoTracking().AnyAsync(candidate => candidate.Id == id, cancellationToken);

    public void Add(EmploymentApplication application) => context.EmploymentApplications.Add(application);

    public Task<EmploymentApplication?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.EmploymentApplications
            .Include(application => application.StatusHistory)
            .FirstOrDefaultAsync(application => application.Id == id, cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}

public sealed class RecruitmentHireRepository(ApplicationDbContext context) : IRecruitmentHireRepository
{
    public Task<ApplicationStatus?> GetApplicationStatusAsync(int applicationId, CancellationToken cancellationToken) =>
        context.EmploymentApplications.AsNoTracking()
            .Where(application => application.Id == applicationId)
            .Select(application => (ApplicationStatus?)application.Status)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<RecruitmentHireLineage?> GetLineageAsync(
        int applicationId,
        CancellationToken cancellationToken)
    {
        var application = await context.EmploymentApplications.AsNoTracking()
            .Where(item => item.Id == applicationId)
            .Select(item => new { item.Id, item.JobOpeningId })
            .FirstOrDefaultAsync(cancellationToken);
        if (application is null)
            return null;

        var offerId = await context.JobOffers.AsNoTracking()
            .Where(offer => offer.EmploymentApplicationId == applicationId && offer.Status == JobOfferStatus.Accepted)
            .Select(offer => (int?)offer.Id)
            .FirstOrDefaultAsync(cancellationToken);
        var opening = await context.JobOpenings.AsNoTracking()
            .Where(item => item.Id == application.JobOpeningId)
            .Select(item => new { item.Id, item.JobRequisitionId })
            .FirstOrDefaultAsync(cancellationToken);
        var requisition = opening is null
            ? null
            : await context.JobRequisitions.AsNoTracking()
                .Where(item => item.Id == opening.JobRequisitionId)
                .Select(item => new { item.Id, item.StaffingRequestId })
                .FirstOrDefaultAsync(cancellationToken);
        var staffingRequest = requisition?.StaffingRequestId is > 0
            ? await context.StaffingRequests.AsNoTracking()
                .Where(item => item.Id == requisition.StaffingRequestId.Value)
                .Select(item => new { item.Id, item.EnvelopeId })
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        return new RecruitmentHireLineage(
            offerId,
            opening?.Id,
            requisition?.Id,
            staffingRequest?.Id,
            staffingRequest?.EnvelopeId);
    }

    public Task<EmploymentApplication?> FindByHireIdempotencyKeyAsync(
        string key,
        CancellationToken cancellationToken) =>
        context.EmploymentApplications.AsNoTracking()
            .FirstOrDefaultAsync(application => application.HireIdempotencyKey == key, cancellationToken);

    public Task<EmploymentApplication?> GetApplicationForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.EmploymentApplications
            .Include(application => application.StatusHistory)
            .FirstOrDefaultAsync(application => application.Id == id, cancellationToken);

    public Task<JobOffer?> GetAcceptedOfferAsync(int applicationId, CancellationToken cancellationToken) =>
        context.JobOffers.FirstOrDefaultAsync(offer =>
            offer.EmploymentApplicationId == applicationId &&
            offer.Status == JobOfferStatus.Accepted,
            cancellationToken);

    public Task<Candidate?> GetCandidateAsync(int candidateId, CancellationToken cancellationToken) =>
        context.Candidates.FirstOrDefaultAsync(candidate => candidate.Id == candidateId, cancellationToken);

    public Task<JobOpening?> GetOpeningAsync(int openingId, CancellationToken cancellationToken) =>
        context.JobOpenings.FirstOrDefaultAsync(opening => opening.Id == openingId, cancellationToken);

    public Task<JobRequisition?> GetRequisitionAsync(int requisitionId, CancellationToken cancellationToken) =>
        context.JobRequisitions.FirstOrDefaultAsync(requisition => requisition.Id == requisitionId, cancellationToken);

    public Task<StaffingRequest?> GetStaffingRequestAsync(int staffingRequestId, CancellationToken cancellationToken) =>
        context.StaffingRequests.FirstOrDefaultAsync(request => request.Id == staffingRequestId, cancellationToken);

    public Task<PositionEnvelope?> GetEnvelopeAsync(int envelopeId, CancellationToken cancellationToken) =>
        context.PositionEnvelopes.FirstOrDefaultAsync(envelope => envelope.Id == envelopeId, cancellationToken);

    public Task<Employee?> GetEmployeeByNumberAsync(string employeeNumber, CancellationToken cancellationToken) =>
        context.Employees.AsNoTracking()
            .FirstOrDefaultAsync(employee => employee.EmployeeNumber == employeeNumber, cancellationToken);

    public void AddEmployee(Employee employee) => context.Employees.Add(employee);
}
