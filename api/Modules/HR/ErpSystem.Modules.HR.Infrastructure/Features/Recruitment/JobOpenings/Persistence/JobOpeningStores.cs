using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Abstractions;
using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Enums;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobOpenings.Persistence;

public sealed class JobOpeningReadStore(
    ApplicationDbContext context,
    TypeAdapterConfig mappingConfig) : IJobOpeningReadStore
{
    public async Task<PageResponse<JobOpeningDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobOpeningStatusFilter? status,
        int? departmentId,
        CancellationToken cancellationToken)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, PaginationRequest.MaxPageSize);
        var query = context.JobOpenings.AsNoTracking();

        if (status.HasValue)
            query = query.Where(opening => opening.Status == (JobOpeningStatus)(int)status.Value);
        if (departmentId.HasValue)
            query = query.Where(opening => opening.DepartmentId == departmentId.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(opening => opening.OpeningNumber.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(opening => opening.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<JobOpeningDto>(mappingConfig)
            .ToListAsync(cancellationToken);

        return new PageResponse<JobOpeningDto>(items, new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public async Task<JobOpeningDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var item = await context.JobOpenings.AsNoTracking()
            .Where(opening => opening.Id == id)
            .ProjectToType<JobOpeningDto>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);
        if (item is null)
            return null;

        var jobDescription = await context.JobDescriptions.AsNoTracking()
            .Where(description =>
                description.PositionId == item.PositionId &&
                description.Status == JobDescriptionStatus.Approved)
            .OrderByDescending(description => description.Version)
            .FirstOrDefaultAsync(cancellationToken);

        if (jobDescription is null)
            return item;

        var defaultWeight = jobDescription.Skills.Count > 0
            ? 100 / jobDescription.Skills.Count
            : 0;

        return item with
        {
            JobDescriptionId = jobDescription.Id,
            Skills = jobDescription.Skills
                .Select(skill => new JobSkillDto(
                    skill.SkillName,
                    skill.ProficiencyLevel,
                    skill.IsMandatory,
                    defaultWeight))
                .ToList()
        };
    }

}

public sealed class JobOpeningRepository(ApplicationDbContext context) : IJobOpeningRepository
{
    public Task<JobRequisitionStatus?> GetRequisitionStatusAsync(
        int jobRequisitionId,
        CancellationToken cancellationToken) =>
        context.JobRequisitions.AsNoTracking()
            .Where(requisition => requisition.Id == jobRequisitionId)
            .Select(requisition => (JobRequisitionStatus?)requisition.Status)
            .FirstOrDefaultAsync(cancellationToken);

    public void Add(JobOpening opening) => context.JobOpenings.Add(opening);

    public Task<JobOpening?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.JobOpenings.FirstOrDefaultAsync(opening => opening.Id == id, cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
