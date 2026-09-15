using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Contracts;

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
            .WithMessage(_localizer[ValidationMessageKeys.Required])
            .Length(3, 50)
            .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

        //check role duplicate
        RuleFor(r => r)
            .MustAsync(IsRoleNameUniqueAsync)
            .WithMessage(_localizer[ValidationMessageKeys.RoleDuplicated]);
    }

    private async Task<bool> IsRoleNameUniqueAsync(RoleRequest request, CancellationToken cancellationToken)
        => !await _queries.RoleNameExistsAsync(request.Name, request.Id, cancellationToken);
}
