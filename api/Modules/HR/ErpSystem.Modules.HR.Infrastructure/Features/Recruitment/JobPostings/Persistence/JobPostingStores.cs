using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobPostings.Persistence;

public sealed class JobPostingReadStore(
    ApplicationDbContext context,
    TypeAdapterConfig mappingConfig) : IJobPostingReadStore
{
    public async Task<PageResponse<JobPostingDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobPostingStatusFilter? status,
        CancellationToken cancellationToken)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, PaginationRequest.MaxPageSize);
        var query = context.JobPostings.AsNoTracking();

        if (status.HasValue)
            query = query.Where(posting => posting.Status == (JobPostingStatus)(int)status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(posting =>
                posting.TitleEn.ToLower().Contains(term) ||
                posting.TitleAr.ToLower().Contains(term) ||
                posting.Slug.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(posting => posting.CreatedOn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<JobPostingDto>(mappingConfig)
            .ToListAsync(cancellationToken);

        return new PageResponse<JobPostingDto>(items, new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public Task<JobPostingDto?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        context.JobPostings.AsNoTracking()
            .Where(posting => posting.Id == id)
            .ProjectToType<JobPostingDto>(mappingConfig)
            .FirstOrDefaultAsync(cancellationToken);
}

public sealed class JobPostingRepository(ApplicationDbContext context) : IJobPostingRepository
{
    public Task<bool> SlugExistsAsync(string normalizedSlug, CancellationToken cancellationToken) =>
        context.JobPostings.AnyAsync(posting => posting.Slug == normalizedSlug, cancellationToken);

    public Task<bool> JobOpeningExistsAsync(int jobOpeningId, CancellationToken cancellationToken) =>
        context.JobOpenings.AnyAsync(opening => opening.Id == jobOpeningId, cancellationToken);

    public void Add(JobPosting posting) => context.JobPostings.Add(posting);

    public Task<JobPosting?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.JobPostings.FirstOrDefaultAsync(posting => posting.Id == id, cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
