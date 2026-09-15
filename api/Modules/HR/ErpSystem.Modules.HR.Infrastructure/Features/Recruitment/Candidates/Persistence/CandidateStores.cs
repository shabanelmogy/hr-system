using System.Linq.Expressions;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Candidates.Persistence;

public sealed class CandidateReadStore(ApplicationDbContext context) : ICandidateReadStore
{
    public async Task<PageResponse<CandidateDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken cancellationToken)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, PaginationRequest.MaxPageSize);
        var query = context.Candidates.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(candidate =>
                candidate.FirstName.ToLower().Contains(term) ||
                candidate.LastName.ToLower().Contains(term) ||
                candidate.Email.ToLower().Contains(term) ||
                (candidate.PhoneNumber != null && candidate.PhoneNumber.Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(candidate => candidate.CreatedOn)
            .Select(Project())
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PageResponse<CandidateDto>(items, new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public Task<CandidateDto?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        context.Candidates.AsNoTracking()
            .Where(candidate => candidate.Id == id)
            .Select(Project())
            .FirstOrDefaultAsync(cancellationToken);

    public Task<bool> EmailExistsAsync(
        string normalizedEmail,
        int? excludingCandidateId,
        CancellationToken cancellationToken) =>
        context.Candidates.AsNoTracking().AnyAsync(candidate =>
            candidate.Email == normalizedEmail &&
            (!excludingCandidateId.HasValue || candidate.Id != excludingCandidateId.Value),
            cancellationToken);

    private static Expression<Func<Candidate, CandidateDto>> Project() => candidate => new CandidateDto
    {
        Id = candidate.Id,
        PublicId = candidate.PublicId,
        FirstName = candidate.FirstName,
        MiddleName = candidate.MiddleName,
        LastName = candidate.LastName,
        FullName = candidate.FirstName +
                   (candidate.MiddleName != null ? " " + candidate.MiddleName : string.Empty) +
                   " " + candidate.LastName,
        Email = candidate.Email,
        PhoneNumber = candidate.PhoneNumber,
        DateOfBirth = candidate.DateOfBirth,
        NationalityCountryId = candidate.NationalityCountryId,
        CurrentCountryId = candidate.CurrentCountryId,
        CurrentStateId = candidate.CurrentStateId,
        City = candidate.City,
        LinkedInUrl = candidate.LinkedInUrl,
        PortfolioUrl = candidate.PortfolioUrl,
        ResumeFileId = candidate.ResumeFileId,
        IsActive = candidate.IsActive,
        CreatedOn = candidate.CreatedOn
    };
}

public sealed class CandidateRepository(ApplicationDbContext context) : ICandidateRepository
{
    public void Add(Candidate candidate) => context.Candidates.Add(candidate);

    public Task<Candidate?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.Candidates.FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
