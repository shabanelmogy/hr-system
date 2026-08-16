using System.Data;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Security.Invitations.Contracts;
using HrManagementSystem.Application.Features.Security.Invitations.Services;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Application.Features.Security.Users.Services;
using HrManagementSystem.Domain.Tenancy.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authorization.Services;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class UserInvitationService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    ICurrentActor currentActor,
    IAuthEmailService emailService,
    ISecurityAuditService securityAudit,
    IOptions<InvitationSettings> settings,
    TimeProvider timeProvider,
    UserErrors userErrors,
    IUserSeatLimitService seatLimits,
    TenantRoleAssignmentService roleAssignments) : IUserInvitationService
{
    private readonly InvitationSettings _settings = settings.Value;

    public async Task<IReadOnlyCollection<UserInvitationResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var tenantId = currentActor.TenantId;
        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(tenantId) || actorCompanyIds.Count == 0)
            return [];

        var invitations = await context.UserInvitations
            .AsNoTracking()
            .Where(invitation => invitation.TenantId == tenantId)
            .OrderByDescending(invitation => invitation.CreatedOn)
            .ToArrayAsync(cancellationToken);

        return invitations
            .Where(invitation => invitation.CompanyIds.All(actorCompanyIds.Contains))
            .Select(ToResponse)
            .ToArray();
    }

    public async Task<Result<UserInvitationResponse>> CreateAsync(
        CreateUserInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await CanAssignAsync(request.CompanyIds, request.DefaultCompanyId, cancellationToken))
            return Result.Failure<UserInvitationResponse>(userErrors.InvalidCompanySelection);

        var resolvedRoles = await roleAssignments.ResolveAssignableRolesAsync(
            currentActor.TenantId!,
            request.Roles,
            cancellationToken);
        if (resolvedRoles is null)
            return Result.Failure<UserInvitationResponse>(userErrors.InvalidRoles);

        var tenantId = currentActor.TenantId!;
        var email = request.Email.Trim();
        var normalizedEmail = userManager.NormalizeEmail(email) ?? email.ToUpperInvariant();
        var normalizedUserName = userManager.NormalizeName(request.UserName.Trim()) ?? request.UserName.Trim().ToUpperInvariant();
        if (await userManager.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken))
            return Result.Failure<UserInvitationResponse>(userErrors.DuplicatedEmail);
        if (await userManager.Users.AnyAsync(user => user.NormalizedUserName == normalizedUserName, cancellationToken))
            return Result.Failure<UserInvitationResponse>(userErrors.DuplicatedUserName);

        await using var transaction = await context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var invitation = await context.UserInvitations
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(candidate =>
                candidate.TenantId == tenantId &&
                candidate.NormalizedEmail == normalizedEmail &&
                candidate.Status == UserInvitationStatus.Pending,
                cancellationToken);

        var existingInvitationId = invitation?.Id;
        var usernameReservedByAnotherInvitation = await context.UserInvitations
            .IgnoreQueryFilters()
            .AnyAsync(candidate =>
                candidate.TenantId == tenantId &&
                candidate.NormalizedUserName == normalizedUserName &&
                candidate.Status == UserInvitationStatus.Pending &&
                (!existingInvitationId.HasValue || candidate.Id != existingInvitationId.Value), cancellationToken);
        if (usernameReservedByAnotherInvitation)
            return Result.Failure<UserInvitationResponse>(userErrors.DuplicatedUserName);

        var token = CreateToken();
        var isNewInvitation = invitation is null;
        if (invitation is null)
        {
            invitation = new UserInvitation
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Email = email,
                NormalizedEmail = normalizedEmail,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                UserName = request.UserName.Trim(),
                NormalizedUserName = normalizedUserName,
                InvitedByUserId = currentActor.UserId!,
                CreatedOn = now,
                DefaultCompanyId = request.DefaultCompanyId
            };
            invitation.SetAssignments(request.Roles, request.CompanyIds);
            context.UserInvitations.Add(invitation);
        }
        else
        {
            invitation.UpdatePendingDetails(
                request.FirstName.Trim(),
                request.LastName.Trim(),
                request.UserName.Trim(),
                normalizedUserName,
                request.Roles,
                request.CompanyIds,
                request.DefaultCompanyId,
                currentActor.UserId!);
        }

        invitation.Renew(HashToken(token), ExpiresOn(now));
        securityAudit.Add(new SecurityAuditRequest(
            isNewInvitation ? "UserInvitationCreated" : "UserInvitationResent",
            "UserInvitation",
            invitation.Id.ToString(),
            TenantId: invitation.TenantId,
            CompanyId: invitation.DefaultCompanyId,
            Metadata: new Dictionary<string, string?> { ["Email"] = invitation.Email }));
        await context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        emailService.SendInvitationEmail(invitation.Email, invitation.FirstName, invitation.Id, token);
        return Result.Success(ToResponse(invitation));
    }

    public async Task<Result<UserInvitationResponse>> ResendAsync(
        Guid invitationId,
        CancellationToken cancellationToken = default)
    {
        var invitation = await FindInActorScopeAsync(invitationId, cancellationToken);
        if (invitation is null || invitation.Status != UserInvitationStatus.Pending)
            return Result.Failure<UserInvitationResponse>(userErrors.InvitationNotFound);

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var token = CreateToken();
        invitation.Renew(HashToken(token), ExpiresOn(now));
        securityAudit.Add(new SecurityAuditRequest(
            "UserInvitationResent", "UserInvitation", invitation.Id.ToString(),
            TenantId: invitation.TenantId, CompanyId: invitation.DefaultCompanyId,
            Metadata: new Dictionary<string, string?> { ["Email"] = invitation.Email }));
        await context.SaveChangesAsync(cancellationToken);
        emailService.SendInvitationEmail(invitation.Email, invitation.FirstName, invitation.Id, token);
        return Result.Success(ToResponse(invitation));
    }

    public async Task<Result> RevokeAsync(Guid invitationId, CancellationToken cancellationToken = default)
    {
        var invitation = await FindInActorScopeAsync(invitationId, cancellationToken);
        if (invitation is null || invitation.Status != UserInvitationStatus.Pending)
            return Result.Success();

        invitation.Revoke(timeProvider.GetUtcNow().UtcDateTime);
        securityAudit.Add(new SecurityAuditRequest(
            "UserInvitationRevoked", "UserInvitation", invitation.Id.ToString(),
            TenantId: invitation.TenantId, CompanyId: invitation.DefaultCompanyId,
            Metadata: new Dictionary<string, string?> { ["Email"] = invitation.Email }));
        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> AcceptAsync(
        AcceptUserInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var tokenHash = HashToken(request.Token);
        await using var transaction = await context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var invitation = await context.UserInvitations
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(candidate => candidate.Id == request.InvitationId, cancellationToken);
        if (invitation is null ||
            !invitation.IsActiveAt(now) ||
            !CryptographicOperations.FixedTimeEquals(
                Convert.FromHexString(invitation.TokenHash),
                Convert.FromHexString(tokenHash)))
        {
            return Result.Failure(userErrors.InvitationInvalidOrExpired);
        }

        var normalizedEmail = userManager.NormalizeEmail(invitation.Email) ?? invitation.Email.ToUpperInvariant();
        var normalizedUserName = userManager.NormalizeName(invitation.UserName) ?? invitation.UserName.ToUpperInvariant();
        if (!await IsInvitationStillActivatableAsync(invitation, now, cancellationToken) ||
            await userManager.Users.AnyAsync(user =>
                user.NormalizedEmail == normalizedEmail ||
                user.NormalizedUserName == normalizedUserName, cancellationToken) ||
            await seatLimits.GetLimitErrorAsync(invitation.TenantId, invitation.Roles, cancellationToken) is not null)
        {
            return Result.Failure(userErrors.InvitationInvalidOrExpired);
        }

        var user = new ApplicationUser
        {
            TenantId = invitation.TenantId,
            Email = invitation.Email,
            UserName = invitation.UserName,
            FirstName = invitation.FirstName,
            LastName = invitation.LastName,
            EmailConfirmed = true
        };
        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            return Result.Failure(userErrors.InvitationInvalidOrExpired);

        var resolvedRoles = await roleAssignments.ResolveAssignableRolesAsync(
            invitation.TenantId,
            invitation.Roles,
            cancellationToken);
        if (resolvedRoles is null)
            return Result.Failure(userErrors.InvitationInvalidOrExpired);
        roleAssignments.AddAssignments(user.Id, resolvedRoles);

        context.UserTenantAccesses.Add(new UserTenantAccess
        {
            TenantId = invitation.TenantId,
            UserId = user.Id,
            IsDefault = true
        });
        foreach (var companyId in invitation.CompanyIds)
        {
            context.UserCompanyAccesses.Add(new UserCompanyAccess
            {
                TenantId = invitation.TenantId,
                UserId = user.Id,
                CompanyId = companyId,
                IsDefault = companyId == invitation.DefaultCompanyId
            });
        }

        invitation.Accept(now);
        securityAudit.Add(new SecurityAuditRequest(
            "UserInvitationAccepted", "UserInvitation", invitation.Id.ToString(),
            TenantId: invitation.TenantId, CompanyId: invitation.DefaultCompanyId,
            Metadata: new Dictionary<string, string?> { ["UserId"] = user.Id }));
        await context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return Result.Success();
    }

    private async Task<UserInvitation?> FindInActorScopeAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = currentActor.TenantId;
        var actorCompanyIds = await GetActorCompanyIdsAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(tenantId) || actorCompanyIds.Count == 0)
            return null;

        var invitation = await context.UserInvitations
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(candidate => candidate.Id == id && candidate.TenantId == tenantId, cancellationToken);
        return invitation is not null && invitation.CompanyIds.All(actorCompanyIds.Contains)
            ? invitation
            : null;
    }

    private async Task<bool> CanAssignAsync(
        IReadOnlyCollection<int> companyIds,
        int defaultCompanyId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentActor.TenantId) ||
            string.IsNullOrWhiteSpace(currentActor.UserId) ||
            companyIds.Count == 0 ||
            !companyIds.Contains(defaultCompanyId))
        {
            return false;
        }

        var requestedCompanyIds = companyIds.Distinct().ToArray();
        var count = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .CountAsync(access =>
                access.TenantId == currentActor.TenantId &&
                access.UserId == currentActor.UserId &&
                access.Company.IsActive &&
                requestedCompanyIds.Contains(access.CompanyId), cancellationToken);
        return count == requestedCompanyIds.Length;
    }

    private async Task<HashSet<int>> GetActorCompanyIdsAsync(CancellationToken cancellationToken) =>
        string.IsNullOrWhiteSpace(currentActor.TenantId) || string.IsNullOrWhiteSpace(currentActor.UserId)
            ? []
            : await context.UserCompanyAccesses.IgnoreQueryFilters().AsNoTracking()
                .Where(access => access.TenantId == currentActor.TenantId && access.UserId == currentActor.UserId)
                .Select(access => access.CompanyId)
                .ToHashSetAsync(cancellationToken);

    private DateTime ExpiresOn(DateTime now) => now.AddHours(_settings.ExpirationHours);

    private static string CreateToken() => WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));

    private static string HashToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private async Task<bool> IsInvitationStillActivatableAsync(
        UserInvitation invitation,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var tenantIsActive = await context.Tenants
            .AsNoTracking()
            .AnyAsync(tenant =>
                tenant.Id == invitation.TenantId &&
                tenant.IsActive &&
                tenant.LifecycleStatus == TenantLifecycleStatus.Active &&
                tenant.SubscriptionStatus != SubscriptionStatus.Suspended &&
                tenant.SubscriptionStatus != SubscriptionStatus.Cancelled &&
                tenant.SubscriptionStatus != SubscriptionStatus.Expired &&
                (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn > now), cancellationToken);
        if (!tenantIsActive)
            return false;

        var companyIds = invitation.CompanyIds.Distinct().ToArray();
        if (companyIds.Length == 0 || !companyIds.Contains(invitation.DefaultCompanyId))
            return false;

        var activeCompanyCount = await context.Companies
            .IgnoreQueryFilters()
            .AsNoTracking()
            .CountAsync(company =>
                company.TenantId == invitation.TenantId &&
                company.IsActive &&
                companyIds.Contains(company.Id), cancellationToken);
        if (activeCompanyCount != companyIds.Length)
            return false;

        var roleNames = invitation.Roles
            .Select(role => role.ToUpperInvariant())
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        if (roleNames.Length == 0)
            return false;

        var activeRoleCount = await context.Roles
            .AsNoTracking()
            .CountAsync(role =>
                !role.IsDeleted &&
                role.NormalizedName != null &&
                roleNames.Contains(role.NormalizedName) &&
                ((role.IsSystem &&
                  (role.NormalizedName == AppRoles.admin.ToUpper() ||
                   role.NormalizedName == AppRoles.user.ToUpper())) ||
                 (!role.IsSystem && role.TenantId == invitation.TenantId)), cancellationToken);
        return activeRoleCount == roleNames.Length;
    }

    private UserInvitationResponse ToResponse(UserInvitation invitation) => new(
        invitation.Id, invitation.Email, invitation.FirstName, invitation.LastName, invitation.UserName,
        invitation.Roles, invitation.CompanyIds, invitation.DefaultCompanyId, GetStatus(invitation),
        invitation.ExpiresOn, invitation.CreatedOn, invitation.AcceptedOn, invitation.RevokedOn);

    private string GetStatus(UserInvitation invitation) =>
        invitation.Status == UserInvitationStatus.Pending && invitation.ExpiresOn <= timeProvider.GetUtcNow().UtcDateTime
            ? "expired"
            : invitation.Status.ToString().ToLowerInvariant();

}
