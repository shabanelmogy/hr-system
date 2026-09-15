using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Abstractions;

public interface IInterviewReadStore
{
    Task<PageResponse<InterviewDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        int? applicationId,
        InterviewStatusFilter? status,
        CancellationToken cancellationToken);

    Task<InterviewDto?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<InterviewScorecardTemplateDto?> GetScorecardTemplateAsync(
        int interviewId,
        CancellationToken cancellationToken);
}

public interface IInterviewRepository
{
    Task<EmploymentApplication?> GetApplicationForUpdateAsync(
        int applicationId,
        CancellationToken cancellationToken);

    Task<bool> AreEmployeesValidAsync(
        IReadOnlyCollection<int> employeeIds,
        CancellationToken cancellationToken);

    void Add(Interview interview);

    Task<Interview?> GetForUpdateAsync(
        int interviewId,
        bool includeEvaluations,
        CancellationToken cancellationToken);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
