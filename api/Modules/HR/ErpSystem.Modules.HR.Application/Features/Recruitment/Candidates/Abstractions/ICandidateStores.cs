using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Abstractions;

public interface ICandidateReadStore
{
    Task<PageResponse<CandidateDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken cancellationToken);

    Task<CandidateDto?> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<bool> EmailExistsAsync(
        string normalizedEmail,
        int? excludingCandidateId,
        CancellationToken cancellationToken);
}

public interface ICandidateRepository
{
    void Add(Candidate candidate);
    Task<Candidate?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
