using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Abstractions;

public interface IJobOpeningReadStore
{
    Task<PageResponse<JobOpeningDto>> GetPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobOpeningStatusFilter? status,
        int? departmentId,
        CancellationToken cancellationToken);

    Task<JobOpeningDto?> GetByIdAsync(int id, CancellationToken cancellationToken);
}

public interface IJobOpeningRepository
{
    Task<JobRequisitionStatus?> GetRequisitionStatusAsync(
        int jobRequisitionId,
        CancellationToken cancellationToken);

    void Add(JobOpening opening);
    Task<JobOpening?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
