using System.Text.Json;
using ErpSystem.Modules.Platform.Application.Features.Security.Invitations.Abstractions;
using ErpSystem.Modules.Platform.Domain.Security.Invitations;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Invitations.Persistence;

public sealed class UserInvitationRepository(PlatformDbContext context) : IUserInvitationRepository
{
    public async Task<IReadOnlyCollection<UserInvitation>> GetAllByTenantAsync(
        string tenantId,
        CancellationToken cancellationToken = default) =>
        (await context.UserInvitations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(invitation => invitation.TenantId == tenantId)
            .OrderByDescending(invitation => invitation.CreatedOn)
            .ToArrayAsync(cancellationToken)
            .ConfigureAwait(false))
        .Select(ToDomain)
        .ToArray();

    public async Task<UserInvitation?> GetByIdAsync(
        Guid invitationId,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.UserInvitations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .SingleOrDefaultAsync(invitation => invitation.Id == invitationId, cancellationToken)
            .ConfigureAwait(false);
        return entity is null ? null : ToDomain(entity);
    }

    public async Task<UserInvitation?> GetPendingByEmailAsync(
        string tenantId,
        string normalizedEmail,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.UserInvitations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .SingleOrDefaultAsync(invitation =>
                invitation.TenantId == tenantId &&
                invitation.NormalizedEmail == normalizedEmail &&
                invitation.Status == PlatformUserInvitationStatus.Pending,
                cancellationToken)
            .ConfigureAwait(false);
        return entity is null ? null : ToDomain(entity);
    }

    public Task<bool> IsPendingUserNameReservedAsync(
        string tenantId,
        string normalizedUserName,
        Guid? exceptInvitationId,
        CancellationToken cancellationToken = default) =>
        context.UserInvitations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(invitation =>
                invitation.TenantId == tenantId &&
                invitation.NormalizedUserName == normalizedUserName &&
                invitation.Status == PlatformUserInvitationStatus.Pending &&
                (!exceptInvitationId.HasValue || invitation.Id != exceptInvitationId.Value),
                cancellationToken);

    public Task AddAsync(UserInvitation invitation, CancellationToken cancellationToken = default)
    {
        context.UserInvitations.Add(ToEntity(invitation));
        return Task.CompletedTask;
    }

    public async Task UpdateAsync(UserInvitation invitation, CancellationToken cancellationToken = default)
    {
        var entity = await context.UserInvitations
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(candidate => candidate.Id == invitation.Id, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new InvalidOperationException($"User invitation '{invitation.Id}' no longer exists.");
        Apply(invitation, entity);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);

    private static UserInvitation ToDomain(PlatformUserInvitation entity) =>
        UserInvitation.Rehydrate(
            entity.Id,
            entity.TenantId,
            entity.Email,
            entity.NormalizedEmail,
            entity.FirstName,
            entity.LastName,
            entity.UserName,
            entity.NormalizedUserName,
            entity.TokenHash,
            entity.Roles,
            entity.CompanyIds,
            entity.DefaultCompanyId,
            entity.InvitedByUserId,
            entity.CreatedOn,
            entity.ExpiresOn,
            entity.AcceptedOn,
            entity.RevokedOn,
            (UserInvitationStatus)entity.Status);

    private static PlatformUserInvitation ToEntity(UserInvitation invitation)
    {
        var entity = new PlatformUserInvitation { Id = invitation.Id };
        Apply(invitation, entity);
        return entity;
    }

    private static void Apply(UserInvitation invitation, PlatformUserInvitation entity)
    {
        entity.TenantId = invitation.TenantId;
        entity.Email = invitation.Email;
        entity.NormalizedEmail = invitation.NormalizedEmail;
        entity.FirstName = invitation.FirstName;
        entity.LastName = invitation.LastName;
        entity.UserName = invitation.UserName;
        entity.NormalizedUserName = invitation.NormalizedUserName;
        entity.TokenHash = invitation.TokenHash;
        entity.RolesJson = JsonSerializer.Serialize(invitation.Roles);
        entity.CompanyIdsJson = JsonSerializer.Serialize(invitation.CompanyIds);
        entity.DefaultCompanyId = invitation.DefaultCompanyId;
        entity.InvitedByUserId = invitation.InvitedByUserId;
        entity.CreatedOn = invitation.CreatedOn;
        entity.ExpiresOn = invitation.ExpiresOn;
        entity.AcceptedOn = invitation.AcceptedOn;
        entity.RevokedOn = invitation.RevokedOn;
        entity.Status = (PlatformUserInvitationStatus)invitation.Status;
    }
}
