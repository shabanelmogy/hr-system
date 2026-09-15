using ErpSystem.Modules.Platform.Domain.Security.Invitations;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Abstractions;

public interface IUserInvitationRepository
{
    Task<IReadOnlyCollection<UserInvitation>> GetAllByTenantAsync(
        string tenantId,
        CancellationToken cancellationToken = default);

    Task<UserInvitation?> GetByIdAsync(
        Guid invitationId,
        CancellationToken cancellationToken = default);

    Task<UserInvitation?> GetPendingByEmailAsync(
        string tenantId,
        string normalizedEmail,
        CancellationToken cancellationToken = default);

    Task<bool> IsPendingUserNameReservedAsync(
        string tenantId,
        string normalizedUserName,
        Guid? exceptInvitationId,
        CancellationToken cancellationToken = default);

    Task AddAsync(UserInvitation invitation, CancellationToken cancellationToken = default);

    Task UpdateAsync(UserInvitation invitation, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IUserInvitationIdentityGateway
{
    string NormalizeEmail(string email);
    string NormalizeUserName(string userName);

    Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken = default);
    Task<bool> UserNameExistsAsync(string normalizedUserName, CancellationToken cancellationToken = default);

    Task<UserInvitationUserCreationResult> CreateUserAsync(
        UserInvitation invitation,
        string password,
        CancellationToken cancellationToken = default);
}

public sealed record UserInvitationUserCreationResult(bool Succeeded, string? UserId)
{
    public static UserInvitationUserCreationResult Success(string userId) => new(true, userId);
    public static UserInvitationUserCreationResult Failure() => new(false, null);
}

public interface IUserInvitationRoleGateway
{
    Task<IReadOnlyCollection<string>?> ResolveAssignableRoleIdsAsync(
        string tenantId,
        IEnumerable<string> roleNames,
        CancellationToken cancellationToken = default);

    void AddAssignments(string userId, IReadOnlyCollection<string> roleIds);
}

public interface IUserInvitationCompanyAccessQuery
{
    Task<IReadOnlySet<int>> GetActorCompanyIdsAsync(
        string tenantId,
        string userId,
        CancellationToken cancellationToken = default);

    Task<bool> AreAllActiveAsync(
        string tenantId,
        IReadOnlyCollection<int> companyIds,
        CancellationToken cancellationToken = default);
}

public interface IUserInvitationTenantEligibilityQuery
{
    Task<bool> IsActiveAsync(
        string tenantId,
        DateTime utcNow,
        CancellationToken cancellationToken = default);
}

public interface IUserInvitationAccessWriter
{
    void AddTenantAndCompanyAccesses(string userId, UserInvitation invitation);
}

public interface IUserInvitationTokenProvider
{
    string CreateToken();
    string HashToken(string token);
    bool FixedTimeEquals(string firstHash, string secondHash);
}

public interface IUserInvitationEmailSender
{
    Task SendAsync(
        UserInvitation invitation,
        string rawToken,
        CancellationToken cancellationToken = default);
}

public interface IUserInvitationUnitOfWork
{
    Task<IUserInvitationTransaction> BeginSerializableAsync(
        CancellationToken cancellationToken = default);
}

public interface IUserInvitationTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken = default);
}
