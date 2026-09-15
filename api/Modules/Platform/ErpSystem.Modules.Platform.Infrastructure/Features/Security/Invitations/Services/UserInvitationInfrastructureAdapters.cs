using System.Data;
using System.Security.Cryptography;
using System.Text;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Abstractions;
using ErpSystem.Modules.Platform.Application.Tenancy;
using ErpSystem.Modules.Platform.Domain.Security.Invitations;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Invitations.Services;

public sealed class UserInvitationIdentityGateway(
    UserManager<PlatformApplicationUser> userManager) : IUserInvitationIdentityGateway
{
    public string NormalizeEmail(string email) =>
        userManager.NormalizeEmail(email) ?? email.ToUpperInvariant();

    public string NormalizeUserName(string userName) =>
        userManager.NormalizeName(userName) ?? userName.ToUpperInvariant();

    public Task<bool> EmailExistsAsync(
        string normalizedEmail,
        CancellationToken cancellationToken = default) =>
        userManager.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken);

    public Task<bool> UserNameExistsAsync(
        string normalizedUserName,
        CancellationToken cancellationToken = default) =>
        userManager.Users.AnyAsync(user => user.NormalizedUserName == normalizedUserName, cancellationToken);

    public async Task<UserInvitationUserCreationResult> CreateUserAsync(
        UserInvitation invitation,
        string password,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var user = new PlatformApplicationUser
        {
            Email = invitation.Email,
            UserName = invitation.UserName,
            FirstName = invitation.FirstName,
            LastName = invitation.LastName,
            EmailConfirmed = true
        };
        var result = await userManager.CreateAsync(user, password).ConfigureAwait(false);
        return result.Succeeded
            ? UserInvitationUserCreationResult.Success(user.Id)
            : UserInvitationUserCreationResult.Failure();
    }
}

public sealed class UserInvitationRoleGateway(
    PlatformDbContext context,
    TenantRoleAssignmentService roleAssignments) : IUserInvitationRoleGateway
{
    public async Task<IReadOnlyCollection<string>?> ResolveAssignableRoleIdsAsync(
        string tenantId,
        IEnumerable<string> roleNames,
        CancellationToken cancellationToken = default)
    {
        var roles = await roleAssignments.ResolveAssignableRolesAsync(
            tenantId,
            roleNames,
            cancellationToken).ConfigureAwait(false);
        return roles?.Select(role => role.Id).ToArray();
    }

    public void AddAssignments(string userId, IReadOnlyCollection<string> roleIds)
    {
        foreach (var roleId in roleIds.Distinct(StringComparer.Ordinal))
        {
            context.UserRoles.Add(new IdentityUserRole<string>
            {
                UserId = userId,
                RoleId = roleId
            });
        }
    }
}

public sealed class UserInvitationCompanyAccessQuery(
    PlatformDbContext context) : IUserInvitationCompanyAccessQuery
{
    public async Task<IReadOnlySet<int>> GetActorCompanyIdsAsync(
        string tenantId,
        string userId,
        CancellationToken cancellationToken = default) =>
        await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.TenantId == tenantId && access.UserId == userId)
            .Select(access => access.CompanyId)
            .ToHashSetAsync(cancellationToken)
            .ConfigureAwait(false);

    public async Task<bool> AreAllActiveAsync(
        string tenantId,
        IReadOnlyCollection<int> companyIds,
        CancellationToken cancellationToken = default)
    {
        var distinctIds = companyIds.Distinct().ToArray();
        if (distinctIds.Length == 0)
            return false;

        var activeCount = await context.Companies
            .IgnoreQueryFilters()
            .AsNoTracking()
            .CountAsync(company =>
                company.TenantId == tenantId &&
                company.IsActive &&
                distinctIds.Contains(company.Id),
                cancellationToken)
            .ConfigureAwait(false);
        return activeCount == distinctIds.Length;
    }
}

public sealed class UserInvitationTenantEligibilityQuery(
    PlatformDbContext context) : IUserInvitationTenantEligibilityQuery
{
    public Task<bool> IsActiveAsync(
        string tenantId,
        DateTime utcNow,
        CancellationToken cancellationToken = default) =>
        context.Tenants
            .AsNoTracking()
            .AnyAsync(tenant =>
                tenant.Id == tenantId &&
                tenant.IsActive &&
                tenant.LifecycleStatus == (int)PlatformTenantLifecycleStatus.Active &&
                tenant.SubscriptionStatus != (int)TenantSubscriptionStatus.Suspended &&
                tenant.SubscriptionStatus != (int)TenantSubscriptionStatus.Cancelled &&
                tenant.SubscriptionStatus != (int)TenantSubscriptionStatus.Expired &&
                (!tenant.SubscriptionEndsOn.HasValue || tenant.SubscriptionEndsOn > utcNow),
                cancellationToken);
}

public sealed class UserInvitationAccessWriter(PlatformDbContext context) : IUserInvitationAccessWriter
{
    public void AddTenantAndCompanyAccesses(string userId, UserInvitation invitation)
    {
        context.UserTenantAccesses.Add(new PlatformUserTenantAccess
        {
            TenantId = invitation.TenantId,
            UserId = userId,
            IsDefault = true
        });
        foreach (var companyId in invitation.CompanyIds)
        {
            context.UserCompanyAccesses.Add(new PlatformUserCompanyAccess
            {
                TenantId = invitation.TenantId,
                UserId = userId,
                CompanyId = companyId,
                IsDefault = companyId == invitation.DefaultCompanyId
            });
        }
    }
}

public sealed class UserInvitationTokenProvider : IUserInvitationTokenProvider
{
    public string CreateToken() => WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));

    public string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    public bool FixedTimeEquals(string firstHash, string secondHash) =>
        CryptographicOperations.FixedTimeEquals(
            Convert.FromHexString(firstHash),
            Convert.FromHexString(secondHash));
}

public sealed class UserInvitationEmailSender(
    IPlatformIdentityEmailSender emailSender) : IUserInvitationEmailSender
{
    public Task SendAsync(
        UserInvitation invitation,
        string rawToken,
        CancellationToken cancellationToken = default) =>
        emailSender.SendInvitationAsync(
            invitation.Email,
            invitation.FirstName,
            invitation.Id,
            rawToken,
            cancellationToken);
}

public sealed class UserInvitationUnitOfWork(PlatformDbContext context) : IUserInvitationUnitOfWork
{
    public async Task<IUserInvitationTransaction> BeginSerializableAsync(
        CancellationToken cancellationToken = default) =>
        new UserInvitationTransaction(
            await context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken).ConfigureAwait(false));

    private sealed class UserInvitationTransaction(
        IDbContextTransaction transaction) : IUserInvitationTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken = default) =>
            transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
