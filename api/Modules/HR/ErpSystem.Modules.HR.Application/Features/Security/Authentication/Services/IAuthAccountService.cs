using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;

/// <summary>
/// Legacy presentation compatibility contract. Platform owns reusable account
/// authentication policy; HR keeps these signatures for route compatibility.
/// </summary>
public interface IAuthAccountService
{
    Task<Result> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken);

    Task<Result> ConfirmEmailAsync(
        ConfirmEmailRequest request,
        CancellationToken cancellationToken);

    Task<Result> ResendConfirmationEmailAsync(
        ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken);

    Task<Result> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken);

    Task<Result> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken);

    Task<Result> ChangePasswordAsync(
        string userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken);
}
