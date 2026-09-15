using System.Text.Json;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Abstractions;
using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Enums;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Interviews.Persistence;

public sealed class InterviewReadStore(
    ApplicationDbContext context,
    TypeAdapterConfig mappingConfig) : IInterviewReadStore
{
    public async Task<PageResponse<InterviewDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        int? applicationId,
        InterviewStatusFilter? status,
        CancellationToken cancellationToken)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, PaginationRequest.MaxPageSize);
        var query = context.Interviews.AsNoTracking();

        if (applicationId.HasValue)
            query = query.Where(interview => interview.EmploymentApplicationId == applicationId.Value);
        if (status.HasValue)
            query = query.Where(interview => interview.Status == (InterviewStatus)(int)status.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(interview => interview.StartsOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<InterviewDto>(mappingConfig)
            .ToListAsync(cancellationToken);

        return new PageResponse<InterviewDto>(items, new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public async Task<InterviewDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var item = await context.Interviews.AsNoTracking()
            .Where(interview => interview.Id == id)
            .ProjectToType<InterviewDto>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);
        if (item is null)
            return null;

        if (item.Evaluations.Count == 0)
            return item;

        var evaluations = item.Evaluations.Select(evaluation =>
        {
            if (string.IsNullOrWhiteSpace(evaluation.SkillEvaluationsJson))
                return evaluation;
            try
            {
                var skills = JsonSerializer.Deserialize<List<InterviewSkillEvaluationDto>>(
                    evaluation.SkillEvaluationsJson) ?? [];
                return evaluation with { SkillEvaluations = skills };
            }
            catch (JsonException)
            {
                return evaluation;
            }
        }).ToList();
        return item with { Evaluations = evaluations };
    }

    public async Task<InterviewScorecardTemplateDto?> GetScorecardTemplateAsync(
        int interviewId,
        CancellationToken cancellationToken)
    {
        var data = await context.Interviews.AsNoTracking()
            .Where(interview => interview.Id == interviewId)
            .Select(interview => new
            {
                InterviewId = interview.Id,
                ApplicationId = interview.EmploymentApplication.Id,
                interview.EmploymentApplication.JobOpening.PositionId,
                CandidateName = interview.EmploymentApplication.Candidate.FirstName +
                    (interview.EmploymentApplication.Candidate.MiddleName != null
                        ? " " + interview.EmploymentApplication.Candidate.MiddleName
                        : string.Empty) +
                    " " + interview.EmploymentApplication.Candidate.LastName,
                PositionTitleEn = interview.EmploymentApplication.JobOpening.Position.JobTitle.TitleEn,
                PositionTitleAr = interview.EmploymentApplication.JobOpening.Position.JobTitle.TitleAr
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (data is null)
            return null;

        var description = await context.JobDescriptions.AsNoTracking()
            .Where(item => item.PositionId == data.PositionId && item.Status == JobDescriptionStatus.Approved)
            .OrderByDescending(item => item.Version)
            .FirstOrDefaultAsync(cancellationToken);
        IReadOnlyList<JobSkillDto> skills = [];
        if (description is not null && description.Skills.Count > 0)
        {
            var defaultWeight = Math.Max(1, 100 / description.Skills.Count);
            skills = description.Skills.Select(skill => new JobSkillDto(
                skill.SkillName,
                skill.ProficiencyLevel,
                skill.IsMandatory,
                defaultWeight)).ToList();
        }

        return new InterviewScorecardTemplateDto(
            data.InterviewId,
            data.ApplicationId,
            data.CandidateName,
            data.PositionTitleEn,
            data.PositionTitleAr,
            description?.Id,
            skills);
    }

}

public sealed class InterviewRepository(ApplicationDbContext context) : IInterviewRepository
{
    public Task<EmploymentApplication?> GetApplicationForUpdateAsync(
        int applicationId,
        CancellationToken cancellationToken) =>
        context.EmploymentApplications
            .Include(application => application.StatusHistory)
            .FirstOrDefaultAsync(application => application.Id == applicationId, cancellationToken);

    public async Task<bool> AreEmployeesValidAsync(
        IReadOnlyCollection<int> employeeIds,
        CancellationToken cancellationToken)
    {
        if (employeeIds.Count == 0)
            return false;
        var distinctIds = employeeIds.Distinct().ToArray();
        var count = await context.Employees.AsNoTracking()
            .CountAsync(employee => distinctIds.Contains(employee.Id), cancellationToken);
        return count == distinctIds.Length;
    }

    public void Add(Interview interview) => context.Interviews.Add(interview);

    public Task<Interview?> GetForUpdateAsync(
        int interviewId,
        bool includeEvaluations,
        CancellationToken cancellationToken)
    {
        IQueryable<Interview> query = context.Interviews.Include(interview => interview.Participants);
        if (includeEvaluations)
            query = query.Include(interview => interview.Evaluations);
        return query.FirstOrDefaultAsync(interview => interview.Id == interviewId, cancellationToken);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
