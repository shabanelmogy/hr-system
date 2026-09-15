using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Abstractions;

public interface IJobPostingReadStore
{
    Task<PageResponse<JobPostingDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobPostingStatusFilter? status,
        CancellationToken cancellationToken);

    Task<JobPostingDto?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public interface IJobPostingRepository
{
    Task<bool> SlugExistsAsync(string normalizedSlug, CancellationToken cancellationToken);
    Task<bool> JobOpeningExistsAsync(int jobOpeningId, CancellationToken cancellationToken);
    void Add(JobPosting posting);
    Task<JobPosting?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
