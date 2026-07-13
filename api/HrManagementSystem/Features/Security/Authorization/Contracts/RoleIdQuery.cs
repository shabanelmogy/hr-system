namespace HrManagementSystem.Features.Security.Authorization.Contracts;

public sealed record RoleIdQuery(string RoleId);

public sealed class RoleIdQueryValidator : AbstractValidator<RoleIdQuery>
{
    public RoleIdQueryValidator(IStringLocalizer<RoleIdQuery> localizer)
    {
        RuleFor(request => request.RoleId)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required]);
    }
}
