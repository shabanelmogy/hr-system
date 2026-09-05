using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Queries;
using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Contracts;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.Management.Abstractions;

public interface IOrganizationalStructureManagement
{
    Task<PageResponse<OrganizationalStructureItem>> GetPageAsync(GetOrganizationalStructureQuery query, CancellationToken cancellationToken);
    Task<OrganizationalStructureItem?> GetAsync(string resource, int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<OrganizationalStructureLookup>> GetLookupAsync(string resource, int? parentId, CancellationToken cancellationToken);
    Task<Result<OrganizationalStructureItem>> CreateAsync(string resource, OrganizationalStructureMutation request, CancellationToken cancellationToken);
    Task<Result<OrganizationalStructureBulkCreateResponse>> CreateBulkAsync(string resource, IReadOnlyList<OrganizationalStructureMutation> requests, CancellationToken cancellationToken);
    Task<Result<OrganizationalStructureItem>> UpdateAsync(string resource, int id, OrganizationalStructureMutation request, CancellationToken cancellationToken);
    Task<Result> ArchiveAsync(string resource, int id, CancellationToken cancellationToken);
    Task<Result> RestoreAsync(string resource, int id, CancellationToken cancellationToken);
    Task<Result<OrganizationalStructureItem>> ApproveJobDescriptionAsync(int id, DateOnly effectiveDate, DateOnly? expiryDate, CancellationToken cancellationToken);
    Task<Result<OrganizationalStructureItem>> RejectJobDescriptionAsync(int id, string reason, CancellationToken cancellationToken);
    Task<IReadOnlyList<EntityChangeLogsResponse>> GetChangeLogsAsync(string resource, int id, CancellationToken cancellationToken);
}

public interface IOrganizationalStructureChangeScheduler
{
    void Schedule(OrganizationalStructureChange change);
}
