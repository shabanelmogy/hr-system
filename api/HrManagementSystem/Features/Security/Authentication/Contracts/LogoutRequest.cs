namespace HrManagementSystem.Features.Security.Authentication.Contracts;

public sealed record LogoutRequest(string RefreshToken);

public sealed class LogoutRequestValidator : AbstractValidator<LogoutRequest>
{
    public LogoutRequestValidator()
    {
        RuleFor(request => request.RefreshToken).NotEmpty();
    }
}
