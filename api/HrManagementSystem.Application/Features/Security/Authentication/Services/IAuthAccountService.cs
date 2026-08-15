using HrManagementSystem.Application.Features.Security.Authentication.Contracts;

namespace HrManagementSystem.Application.Features.Security.Authentication.Services;

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
}
