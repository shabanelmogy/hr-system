using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Policies;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Services;
using ErpSystem.Modules.Platform.Contracts.SecurityAudits;
using ErpSystem.Modules.Platform.Domain.Security.Invitations;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Invitations;

public sealed record GetUserInvitationsQuery : IQuery<IReadOnlyCollection<UserInvitationResponse>>;
public sealed record CreateUserInvitationCommand(CreateUserInvitationRequest Request)
    : ICommand<Result<UserInvitationResponse>>;
public sealed record ResendUserInvitationCommand(Guid InvitationId)
    : ICommand<Result<UserInvitationResponse>>;
public sealed record RevokeUserInvitationCommand(Guid InvitationId) : ICommand<Result>;
public sealed record AcceptUserInvitationCommand(AcceptUserInvitationRequest Request) : ICommand<Result>;

public sealed class GetUserInvitationsQueryHandler(
    IUserInvitationRepository repository,
    IUserInvitationCompanyAccessQuery companyAccess,
    IUserInvitationPolicy policy,
    ICurrentExecutionContext executionContext,
    TimeProvider timeProvider)
    : IQueryHandler<GetUserInvitationsQuery, IReadOnlyCollection<UserInvitationResponse>>
{
    public async Task<IReadOnlyCollection<UserInvitationResponse>> Handle(
        GetUserInvitationsQuery query,
        CancellationToken cancellationToken)
    {
        var scope = UserInvitationUseCaseScope.TryGet(executionContext);
        if (scope is null)
            return [];

        var actorCompanyIds = await companyAccess.GetActorCompanyIdsAsync(
            scope.Value.TenantId,
            scope.Value.UserId,
            cancellationToken).ConfigureAwait(false);
        if (actorCompanyIds.Count == 0)
            return [];

        var invitations = await repository.GetAllByTenantAsync(
            scope.Value.TenantId,
            cancellationToken).ConfigureAwait(false);
        var now = timeProvider.GetUtcNow().UtcDateTime;

        return invitations
            .Where(invitation => invitation.CompanyIds.All(actorCompanyIds.Contains))
            .Select(invitation => UserInvitationMapping.ToResponse(invitation, policy, now))
            .ToArray();
    }
}

public sealed class CreateUserInvitationCommandHandler(
    IUserInvitationRepository repository,
    IUserInvitationIdentityGateway identity,
    IUserInvitationRoleGateway roles,
    IUserInvitationCompanyAccessQuery companyAccess,
    IUserInvitationTokenProvider tokens,
    IUserInvitationEmailSender emailSender,
    IUserInvitationUnitOfWork unitOfWork,
    IUserInvitationPolicy policy,
    ISecurityAuditService securityAudit,
    UserErrors errors,
    ICurrentExecutionContext executionContext,
    TimeProvider timeProvider)
    : ICommandHandler<CreateUserInvitationCommand, Result<UserInvitationResponse>>
{
    public async Task<Result<UserInvitationResponse>> Handle(
        CreateUserInvitationCommand command,
        CancellationToken cancellationToken)
    {
        var scope = UserInvitationUseCaseScope.TryGet(executionContext);
        if (scope is null || !await UserInvitationUseCaseScope.CanAssignCompaniesAsync(
                companyAccess,
                scope.Value,
                command.Request.CompanyIds,
                command.Request.DefaultCompanyId,
                cancellationToken).ConfigureAwait(false))
        {
            return Result.Failure<UserInvitationResponse>(errors.InvalidCompanySelection);
        }

        var roleIds = await roles.ResolveAssignableRoleIdsAsync(
            scope.Value.TenantId,
            command.Request.Roles,
            cancellationToken).ConfigureAwait(false);
        if (roleIds is null)
            return Result.Failure<UserInvitationResponse>(errors.InvalidRoles);

        var email = command.Request.Email.Trim();
        var userName = command.Request.UserName.Trim();
        var normalizedEmail = identity.NormalizeEmail(email);
        var normalizedUserName = identity.NormalizeUserName(userName);
        if (await identity.EmailExistsAsync(normalizedEmail, cancellationToken).ConfigureAwait(false))
            return Result.Failure<UserInvitationResponse>(errors.DuplicatedEmail);
        if (await identity.UserNameExistsAsync(normalizedUserName, cancellationToken).ConfigureAwait(false))
            return Result.Failure<UserInvitationResponse>(errors.DuplicatedUserName);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var rawToken = tokens.CreateToken();
        UserInvitation invitation;
        bool isNew;

        await using (var transaction = await unitOfWork.BeginSerializableAsync(cancellationToken).ConfigureAwait(false))
        {
            var existingInvitation = await repository.GetPendingByEmailAsync(
                scope.Value.TenantId,
                normalizedEmail,
                cancellationToken).ConfigureAwait(false);
            isNew = existingInvitation is null;
            invitation = existingInvitation
                ?? UserInvitation.Create(
                    Guid.NewGuid(),
                    scope.Value.TenantId,
                    email,
                    normalizedEmail,
                    command.Request.FirstName.Trim(),
                    command.Request.LastName.Trim(),
                    userName,
                    normalizedUserName,
                    command.Request.Roles,
                    command.Request.CompanyIds,
                    command.Request.DefaultCompanyId,
                    scope.Value.UserId,
                    now);
            if (await repository.IsPendingUserNameReservedAsync(
                    scope.Value.TenantId,
                    normalizedUserName,
                    isNew ? null : invitation.Id,
                    cancellationToken).ConfigureAwait(false))
            {
                return Result.Failure<UserInvitationResponse>(errors.DuplicatedUserName);
            }

            if (!isNew)
            {
                invitation.UpdatePendingDetails(
                    command.Request.FirstName.Trim(),
                    command.Request.LastName.Trim(),
                    userName,
                    normalizedUserName,
                    command.Request.Roles,
                    command.Request.CompanyIds,
                    command.Request.DefaultCompanyId,
                    scope.Value.UserId);
            }

            invitation.Renew(tokens.HashToken(rawToken), policy.GetExpiration(now));
            if (isNew)
                await repository.AddAsync(invitation, cancellationToken).ConfigureAwait(false);
            else
                await repository.UpdateAsync(invitation, cancellationToken).ConfigureAwait(false);

            securityAudit.Add(UserInvitationMapping.Audit(
                isNew ? "UserInvitationCreated" : "UserInvitationResent",
                invitation,
                "Email",
                invitation.Email));
            await repository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        }

        await emailSender.SendAsync(invitation, rawToken, cancellationToken).ConfigureAwait(false);
        return Result.Success(UserInvitationMapping.ToResponse(invitation, policy, now));
    }
}

public sealed class ResendUserInvitationCommandHandler(
    IUserInvitationRepository repository,
    IUserInvitationCompanyAccessQuery companyAccess,
    IUserInvitationTokenProvider tokens,
    IUserInvitationEmailSender emailSender,
    IUserInvitationPolicy policy,
    ISecurityAuditService securityAudit,
    UserErrors errors,
    ICurrentExecutionContext executionContext,
    TimeProvider timeProvider)
    : ICommandHandler<ResendUserInvitationCommand, Result<UserInvitationResponse>>
{
    public async Task<Result<UserInvitationResponse>> Handle(
        ResendUserInvitationCommand command,
        CancellationToken cancellationToken)
    {
        var invitation = await UserInvitationUseCaseScope.FindInActorScopeAsync(
            command.InvitationId,
            repository,
            companyAccess,
            executionContext,
            cancellationToken).ConfigureAwait(false);
        if (invitation is null || invitation.Status != UserInvitationStatus.Pending)
            return Result.Failure<UserInvitationResponse>(errors.InvitationNotFound);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var rawToken = tokens.CreateToken();
        invitation.Renew(tokens.HashToken(rawToken), policy.GetExpiration(now));
        await repository.UpdateAsync(invitation, cancellationToken).ConfigureAwait(false);
        securityAudit.Add(UserInvitationMapping.Audit(
            "UserInvitationResent", invitation, "Email", invitation.Email));
        await repository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        await emailSender.SendAsync(invitation, rawToken, cancellationToken).ConfigureAwait(false);
        return Result.Success(UserInvitationMapping.ToResponse(invitation, policy, now));
    }
}

public sealed class RevokeUserInvitationCommandHandler(
    IUserInvitationRepository repository,
    IUserInvitationCompanyAccessQuery companyAccess,
    ISecurityAuditService securityAudit,
    ICurrentExecutionContext executionContext,
    TimeProvider timeProvider)
    : ICommandHandler<RevokeUserInvitationCommand, Result>
{
    public async Task<Result> Handle(RevokeUserInvitationCommand command, CancellationToken cancellationToken)
    {
        var invitation = await UserInvitationUseCaseScope.FindInActorScopeAsync(
            command.InvitationId,
            repository,
            companyAccess,
            executionContext,
            cancellationToken).ConfigureAwait(false);
        if (invitation is null || invitation.Status != UserInvitationStatus.Pending)
            return Result.Success();

        invitation.Revoke(timeProvider.GetUtcNow().UtcDateTime);
        await repository.UpdateAsync(invitation, cancellationToken).ConfigureAwait(false);
        securityAudit.Add(UserInvitationMapping.Audit(
            "UserInvitationRevoked", invitation, "Email", invitation.Email));
        await repository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }
}

public sealed class AcceptUserInvitationCommandHandler(
    IUserInvitationRepository repository,
    IUserInvitationIdentityGateway identity,
    IUserInvitationRoleGateway roles,
    IUserInvitationCompanyAccessQuery companyAccess,
    IUserInvitationTenantEligibilityQuery tenantEligibility,
    IUserInvitationAccessWriter accessWriter,
    IUserInvitationTokenProvider tokens,
    IUserInvitationUnitOfWork unitOfWork,
    IUserSeatLimitService seatLimits,
    ISecurityAuditService securityAudit,
    UserErrors errors,
    TimeProvider timeProvider)
    : ICommandHandler<AcceptUserInvitationCommand, Result>
{
    public async Task<Result> Handle(AcceptUserInvitationCommand command, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var providedHash = tokens.HashToken(command.Request.Token);

        await using var transaction = await unitOfWork.BeginSerializableAsync(cancellationToken).ConfigureAwait(false);
        var invitation = await repository.GetByIdAsync(command.Request.InvitationId, cancellationToken)
            .ConfigureAwait(false);
        if (invitation is null ||
            !invitation.IsActiveAt(now) ||
            !tokens.FixedTimeEquals(invitation.TokenHash, providedHash))
        {
            return Result.Failure(errors.InvitationInvalidOrExpired);
        }

        if (!await tenantEligibility.IsActiveAsync(invitation.TenantId, now, cancellationToken).ConfigureAwait(false) ||
            !await companyAccess.AreAllActiveAsync(invitation.TenantId, invitation.CompanyIds, cancellationToken).ConfigureAwait(false))
        {
            return Result.Failure(errors.InvitationInvalidOrExpired);
        }

        var roleIds = await roles.ResolveAssignableRoleIdsAsync(
            invitation.TenantId,
            invitation.Roles,
            cancellationToken).ConfigureAwait(false);
        if (roleIds is null)
            return Result.Failure(errors.InvitationInvalidOrExpired);

        var normalizedEmail = identity.NormalizeEmail(invitation.Email);
        var normalizedUserName = identity.NormalizeUserName(invitation.UserName);
        if (await identity.EmailExistsAsync(normalizedEmail, cancellationToken).ConfigureAwait(false) ||
            await identity.UserNameExistsAsync(normalizedUserName, cancellationToken).ConfigureAwait(false) ||
            await seatLimits.GetLimitErrorAsync(invitation.TenantId, invitation.Roles, cancellationToken).ConfigureAwait(false) is not null)
        {
            return Result.Failure(errors.InvitationInvalidOrExpired);
        }

        var creation = await identity.CreateUserAsync(
            invitation,
            command.Request.Password,
            cancellationToken).ConfigureAwait(false);
        if (!creation.Succeeded || string.IsNullOrWhiteSpace(creation.UserId))
            return Result.Failure(errors.InvitationInvalidOrExpired);

        roles.AddAssignments(creation.UserId, roleIds);
        accessWriter.AddTenantAndCompanyAccesses(creation.UserId, invitation);
        invitation.Accept(now);
        await repository.UpdateAsync(invitation, cancellationToken).ConfigureAwait(false);
        securityAudit.Add(UserInvitationMapping.Audit(
            "UserInvitationAccepted", invitation, "UserId", creation.UserId));
        await repository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        return Result.Success();
    }
}

internal static class UserInvitationUseCaseScope
{
    public static (string TenantId, string UserId)? TryGet(ICurrentExecutionContext executionContext)
    {
        var tenantId = executionContext.TenantId?.Trim();
        var userId = executionContext.UserId?.Trim();
        return string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(userId)
            ? null
            : (tenantId, userId);
    }

    public static async Task<bool> CanAssignCompaniesAsync(
        IUserInvitationCompanyAccessQuery companyAccess,
        (string TenantId, string UserId) scope,
        IReadOnlyCollection<int> companyIds,
        int defaultCompanyId,
        CancellationToken cancellationToken)
    {
        if (companyIds.Count == 0 || !companyIds.Contains(defaultCompanyId))
            return false;

        var actorCompanyIds = await companyAccess.GetActorCompanyIdsAsync(
            scope.TenantId,
            scope.UserId,
            cancellationToken).ConfigureAwait(false);
        var requestedCompanyIds = companyIds.Distinct().ToArray();
        return requestedCompanyIds.All(actorCompanyIds.Contains) &&
               await companyAccess.AreAllActiveAsync(
                   scope.TenantId,
                   requestedCompanyIds,
                   cancellationToken).ConfigureAwait(false);
    }

    public static async Task<UserInvitation?> FindInActorScopeAsync(
        Guid invitationId,
        IUserInvitationRepository repository,
        IUserInvitationCompanyAccessQuery companyAccess,
        ICurrentExecutionContext executionContext,
        CancellationToken cancellationToken)
    {
        var scope = TryGet(executionContext);
        if (scope is null)
            return null;

        var actorCompanyIds = await companyAccess.GetActorCompanyIdsAsync(
            scope.Value.TenantId,
            scope.Value.UserId,
            cancellationToken).ConfigureAwait(false);
        if (actorCompanyIds.Count == 0)
            return null;

        var invitation = await repository.GetByIdAsync(invitationId, cancellationToken).ConfigureAwait(false);
        return invitation is not null &&
               string.Equals(invitation.TenantId, scope.Value.TenantId, StringComparison.Ordinal) &&
               invitation.CompanyIds.All(actorCompanyIds.Contains)
            ? invitation
            : null;
    }
}

internal static class UserInvitationMapping
{
    public static UserInvitationResponse ToResponse(
        UserInvitation invitation,
        IUserInvitationPolicy policy,
        DateTime utcNow) => new(
        invitation.Id,
        invitation.Email,
        invitation.FirstName,
        invitation.LastName,
        invitation.UserName,
        invitation.Roles,
        invitation.CompanyIds,
        invitation.DefaultCompanyId,
        policy.GetStatus(invitation, utcNow),
        invitation.ExpiresOn,
        invitation.CreatedOn,
        invitation.AcceptedOn,
        invitation.RevokedOn);

    public static SecurityAuditRequest Audit(
        string action,
        UserInvitation invitation,
        string metadataKey,
        string metadataValue) => new(
        action,
        "PlatformUserInvitation",
        invitation.Id.ToString(),
        TenantId: invitation.TenantId,
        CompanyId: invitation.DefaultCompanyId,
        Metadata: new Dictionary<string, string?> { [metadataKey] = metadataValue });
}
