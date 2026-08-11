namespace HrManagementSystem.Application.Features.Security.Authorization.Contracts;

public class RoleRequestValidator : AbstractValidator<RoleRequest>
{
    private readonly IRoleValidationQueries _queries;
    private readonly IStringLocalizer<RoleRequest> _localizer;

    public RoleRequestValidator(IRoleValidationQueries queries, IStringLocalizer<RoleRequest> localizer)
    {
        _localizer = localizer;
        _queries = queries;

        RuleFor(r => r.Name)
            .Trimmed()
            .NotEmpty()
            .WithMessage(_localizer[Strings.Required])
            .Length(3, 50)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        //check role duplicate
        RuleFor(r => r)
            .MustAsync(IsRoleNameUniqueAsync)
            .WithMessage(_localizer[Strings.RoleDuplicated]);
    }

    private async Task<bool> IsRoleNameUniqueAsync(RoleRequest request, CancellationToken cancellationToken)
        => !await _queries.RoleNameExistsAsync(request.Name, request.Id, cancellationToken);
}
