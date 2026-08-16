using HrManagementSystem.Application.Features.Security.Invitations.Contracts;

namespace HrManagementSystem.Application.Features.Security.Invitations.Services;

public interface IUserInvitationService
{
    Task<IReadOnlyCollection<UserInvitationResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<UserInvitationResponse>> CreateAsync(CreateUserInvitationRequest request, CancellationToken cancellationToken = default);
    Task<Result<UserInvitationResponse>> ResendAsync(Guid invitationId, CancellationToken cancellationToken = default);
    Task<Result> RevokeAsync(Guid invitationId, CancellationToken cancellationToken = default);
    Task<Result> AcceptAsync(AcceptUserInvitationRequest request, CancellationToken cancellationToken = default);
}
