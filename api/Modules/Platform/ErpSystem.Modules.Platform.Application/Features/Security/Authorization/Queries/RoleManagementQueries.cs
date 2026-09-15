using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Errors;
using ErpSystem.Modules.Platform.Application.Modules;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Queries;

public sealed record GetAllRolesQuery : IQuery<IReadOnlyList<RoleResponse>>;
public sealed record GetRoleQuery(string Id) : IQuery<Result<RoleDetailResponse>>;
public sealed record GetRoleClaimsQuery(string RoleId) : IQuery<Result<RoleResponse>>;

public sealed class GetAllRolesQueryHandler(
    IRoleManagementReadStore store,
    ICurrentActor currentActor)
    : IQueryHandler<GetAllRolesQuery, IReadOnlyList<RoleResponse>>
{
    public Task<IReadOnlyList<RoleResponse>> Handle(
        GetAllRolesQuery request,
        CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId;
        return string.IsNullOrWhiteSpace(tenantId)
            ? Task.FromResult<IReadOnlyList<RoleResponse>>([])
            : store.GetAllAsync(tenantId, cancellationToken);
    }
}

public sealed class GetRoleQueryHandler(
    IRoleManagementReadStore store,
    ICurrentActor currentActor,
    RoleErrors errors)
    : IQueryHandler<GetRoleQuery, Result<RoleDetailResponse>>
{
    public async Task<Result<RoleDetailResponse>> Handle(
        GetRoleQuery request,
        CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(request.Id))
            return Result.Failure<RoleDetailResponse>(errors.RoleNotFound);

        var role = await store.GetByIdAsync(tenantId, request.Id, cancellationToken);
        return role is null
            ? Result.Failure<RoleDetailResponse>(errors.RoleNotFound)
            : Result.Success(role);
    }
}

public sealed class GetRoleClaimsQueryHandler(
    IRoleManagementReadStore store,
    ICurrentActor currentActor,
    IModuleCatalogPolicy moduleCatalog,
    RoleErrors errors)
    : IQueryHandler<GetRoleClaimsQuery, Result<RoleResponse>>
{
    public async Task<Result<RoleResponse>> Handle(
        GetRoleClaimsQuery request,
        CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(request.RoleId))
            return Result.Failure<RoleResponse>(errors.RoleNotFound);

        var role = await store.GetClaimsAsync(tenantId, request.RoleId, cancellationToken);
        if (role is null)
            return Result.Failure<RoleResponse>(errors.RoleNotFound);

        var rolePermissions = role.Permissions.ToHashSet(StringComparer.Ordinal);
        var claims = moduleCatalog.GetTenantAssignablePermissions()
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .Order(StringComparer.Ordinal)
            .Select(permission => new CheckBoxViewModel
            {
                DisplayValue = permission,
                IsSelected = rolePermissions.Contains(permission)
            })
            .ToList();

        return Result.Success(new RoleResponse(
            role.Id,
            role.Name,
            role.IsDeleted,
            claims,
            role.IsSystem));
    }
}
