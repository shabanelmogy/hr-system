using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Errors;
using ErpSystem.Modules.Platform.Application.Modules;
using PlatformSecurityAuditRequest = ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditRequest;
using PlatformSecurityAuditService = ErpSystem.Modules.Platform.Contracts.SecurityAudits.ISecurityAuditService;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Commands;

public sealed record CreateRoleCommand(RoleRequest Request) : ICommand<Result<RoleResponse>>;
public sealed record UpdateRoleCommand(RoleRequest Request) : ICommand<Result>;
public sealed record ToggleRoleStatusCommand(string Id) : ICommand<Result>;
public sealed record UpdateRoleClaimsCommand(RoleRequest Request) : ICommand<Result>;

public sealed class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator(IValidator<RoleRequest> validator) =>
        RuleFor(command => command.Request).SetValidator(validator);
}

public sealed class UpdateRoleCommandValidator : AbstractValidator<UpdateRoleCommand>
{
    public UpdateRoleCommandValidator(IValidator<RoleRequest> validator) =>
        RuleFor(command => command.Request).SetValidator(validator);
}

public sealed class UpdateRoleClaimsCommandValidator : AbstractValidator<UpdateRoleClaimsCommand>
{
    public UpdateRoleClaimsCommandValidator(IValidator<RoleRequest> validator) =>
        RuleFor(command => command.Request).SetValidator(validator);
}

public sealed class CreateRoleCommandHandler(
    IRoleRepository repository,
    IRoleUnitOfWork unitOfWork,
    IRoleLockResourceFactory lockResources,
    IRolePostCommitEffects effects,
    ICurrentActor currentActor,
    PlatformSecurityAuditService securityAudit,
    RoleErrors errors)
    : ICommandHandler<CreateRoleCommand, Result<RoleResponse>>
{
    public async Task<Result<RoleResponse>> Handle(
        CreateRoleCommand command,
        CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId;
        var request = command.Request;
        if (string.IsNullOrWhiteSpace(tenantId) || RoleManagementPolicy.IsReservedSystemRoleName(request.Name))
            return Result.Failure<RoleResponse>(errors.RoleNotFound);

        var roleName = request.Name.Trim();
        var normalizedName = repository.NormalizeName(roleName);
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [lockResources.Create(tenantId, $"name:{normalizedName}")],
            async token =>
            {
                var created = await repository.CreateAsync(tenantId, roleName, token);
                if (created.IsFailure)
                    return Result.Failure<RoleMutationSnapshot>(created.Error);

                var role = created.Value;
                securityAudit.Add(new PlatformSecurityAuditRequest(
                    "RoleCreated",
                    "PlatformApplicationRole",
                    role.Id,
                    TenantId: tenantId,
                    Metadata: new Dictionary<string, string?>
                    {
                        ["RoleName"] = role.Name,
                        ["IsSystem"] = role.IsSystem.ToString()
                    }));
                await unitOfWork.SaveChangesAsync(token);
                return created;
            },
            cancellationToken);

        if (result.IsFailure)
            return Result.Failure<RoleResponse>(result.Error);

        effects.PublishRoleChanged(tenantId, result.Value.Id, "Create");
        return Result.Success(RoleManagementPolicy.ToResponse(result.Value));
    }
}

public sealed class UpdateRoleCommandHandler(
    IRoleRepository repository,
    IRoleUnitOfWork unitOfWork,
    IRoleLockResourceFactory lockResources,
    IRolePostCommitEffects effects,
    ICurrentActor currentActor,
    PlatformSecurityAuditService securityAudit,
    RoleErrors errors)
    : ICommandHandler<UpdateRoleCommand, Result>
{
    public async Task<Result> Handle(UpdateRoleCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(request.Id) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            RoleManagementPolicy.IsReservedSystemRoleName(request.Name))
        {
            return Result.Failure(errors.RoleNotFound);
        }

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [lockResources.Create(tenantId, $"id:{request.Id}")],
            async token =>
            {
                var renamed = await repository.RenameAsync(tenantId, request.Id!, request.Name.Trim(), token);
                if (renamed.IsFailure)
                    return renamed;

                securityAudit.Add(new PlatformSecurityAuditRequest(
                    "RoleUpdated",
                    "PlatformApplicationRole",
                    renamed.Value.Role.Id,
                    TenantId: tenantId,
                    Metadata: new Dictionary<string, string?>
                    {
                        ["PreviousName"] = renamed.Value.PreviousName,
                        ["NewName"] = renamed.Value.Role.Name
                    }));
                await unitOfWork.SaveChangesAsync(token);
                return renamed;
            },
            cancellationToken);

        if (result.IsFailure)
            return Result.Failure(result.Error);

        effects.PublishRoleChanged(tenantId, result.Value.Role.Id, "Update");
        return Result.Success();
    }
}

public sealed class ToggleRoleStatusCommandHandler(
    IRoleRepository repository,
    IRoleUnitOfWork unitOfWork,
    IRoleLockResourceFactory lockResources,
    IRolePostCommitEffects effects,
    ICurrentActor currentActor,
    PlatformSecurityAuditService securityAudit,
    RoleErrors errors,
    TimeProvider timeProvider)
    : ICommandHandler<ToggleRoleStatusCommand, Result>
{
    public async Task<Result> Handle(
        ToggleRoleStatusCommand command,
        CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(tenantId))
            return Result.Failure(errors.RoleNotFound);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [lockResources.Create(tenantId, $"id:{command.Id}")],
            async token =>
            {
                var toggled = await repository.ToggleStatusAsync(
                    tenantId,
                    command.Id,
                    "Role deactivated",
                    timeProvider.GetUtcNow().UtcDateTime,
                    token);
                if (toggled.IsFailure)
                    return toggled;

                var role = toggled.Value.Role;
                securityAudit.Add(new PlatformSecurityAuditRequest(
                    role.IsDeleted ? "RoleArchived" : "RoleRestored",
                    "PlatformApplicationRole",
                    role.Id,
                    TenantId: tenantId,
                    Metadata: new Dictionary<string, string?>
                    {
                        ["RoleName"] = role.Name,
                        ["IsDeleted"] = role.IsDeleted.ToString(),
                        ["AffectedUsersCount"] = toggled.Value.AffectedUserIds.Count.ToString(CultureInfo.InvariantCulture)
                    }));
                await unitOfWork.SaveChangesAsync(token);
                return toggled;
            },
            cancellationToken);

        if (result.IsFailure)
            return Result.Failure(result.Error);

        if (result.Value.Role.IsDeleted)
        {
            effects.QueueSessionRevocations(
                result.Value.AffectedUserIds,
                "Your session was revoked because your assigned role was deactivated.");
        }

        effects.PublishRoleChanged(
            tenantId,
            result.Value.Role.Id,
            result.Value.Role.IsDeleted ? "Delete" : "Restore");
        return Result.Success();
    }
}

public sealed class UpdateRoleClaimsCommandHandler(
    IRoleRepository repository,
    IRoleUnitOfWork unitOfWork,
    IRoleLockResourceFactory lockResources,
    IRolePostCommitEffects effects,
    ICurrentActor currentActor,
    IModuleCatalogPolicy moduleCatalog,
    PlatformSecurityAuditService securityAudit,
    RoleErrors errors,
    TimeProvider timeProvider)
    : ICommandHandler<UpdateRoleClaimsCommand, Result>
{
    public async Task<Result> Handle(
        UpdateRoleClaimsCommand command,
        CancellationToken cancellationToken)
    {
        var request = command.Request;
        var tenantId = currentActor.TenantId;
        if (string.IsNullOrWhiteSpace(request.Id) || string.IsNullOrWhiteSpace(tenantId))
            return Result.Failure(errors.RoleNotFound);

        var selectedPermissions = request.RoleClaims?
            .Where(claim => claim.IsSelected)
            .Select(claim => claim.DisplayValue)
            .ToArray() ?? [];
        var assignablePermissions = moduleCatalog.GetTenantAssignablePermissions()
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .ToHashSet(StringComparer.Ordinal);
        if (selectedPermissions.Any(permission => !assignablePermissions.Contains(permission)) ||
            selectedPermissions.Distinct(StringComparer.Ordinal).Count() != selectedPermissions.Length)
        {
            return Result.Failure(errors.InvalidPermissions);
        }

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [lockResources.Create(tenantId, $"id:{request.Id}")],
            async token =>
            {
                var updated = await repository.ReplaceClaimsAsync(
                    tenantId,
                    request.Id!,
                    selectedPermissions,
                    "Role permissions changed",
                    timeProvider.GetUtcNow().UtcDateTime,
                    token);
                if (updated.IsFailure)
                    return updated;

                securityAudit.Add(new PlatformSecurityAuditRequest(
                    "RolePermissionsUpdated",
                    "PlatformApplicationRole",
                    updated.Value.Role.Id,
                    TenantId: tenantId,
                    Metadata: new Dictionary<string, string?>
                    {
                        ["RoleName"] = updated.Value.Role.Name,
                        ["PreviousPermissions"] = string.Join(',', updated.Value.PreviousPermissions.OrderBy(claim => claim, StringComparer.Ordinal)),
                        ["NewPermissions"] = string.Join(',', updated.Value.NewPermissions.OrderBy(claim => claim, StringComparer.Ordinal)),
                        ["AffectedUsersCount"] = updated.Value.AffectedUserIds.Count.ToString(CultureInfo.InvariantCulture)
                    }));
                await unitOfWork.SaveChangesAsync(token);
                return updated;
            },
            cancellationToken);

        if (result.IsFailure)
            return Result.Failure(result.Error);

        effects.QueueSessionRevocations(
            result.Value.AffectedUserIds,
            "Your session was revoked because your role permissions were updated.");
        effects.PublishRoleClaimsChanged(tenantId, result.Value.Role.Id);
        return Result.Success();
    }
}

internal static class RoleManagementPolicy
{
    public static bool IsReservedSystemRoleName(string roleName) =>
        string.Equals(roleName.Trim(), PlatformRoleNames.SuperAdmin, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(roleName.Trim(), PlatformRoleNames.Admin, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(roleName.Trim(), PlatformRoleNames.User, StringComparison.OrdinalIgnoreCase);

    public static RoleResponse ToResponse(RoleMutationSnapshot role) =>
        new(role.Id, role.Name, role.IsDeleted, null, role.IsSystem);
}
