namespace HrManagementSystem.Features.Security.Authentication.Contracts;

public sealed record RevokeUserSessionsRequest(string UserId);

public sealed class RevokeUserSessionsRequestValidator : AbstractValidator<RevokeUserSessionsRequest>
{
    public RevokeUserSessionsRequestValidator(IStringLocalizer<RevokeUserSessionsRequest> localizer)
    {
        RuleFor(request => request.UserId)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required]);
    }
}
