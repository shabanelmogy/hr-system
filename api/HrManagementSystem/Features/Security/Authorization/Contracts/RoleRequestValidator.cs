namespace HrManagementSystem.Features.Security.Authorization.Contracts;

public class RoleRequestValidator : AbstractValidator<RoleRequest>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStringLocalizer<RoleRequest> _localizer;

    public RoleRequestValidator(ApplicationDbContext dbContext,IStringLocalizer<RoleRequest> localizer)
    {
        _localizer = localizer;
        _dbContext = dbContext;

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
    {
        if (string.IsNullOrEmpty(request.Id))
            return !await _dbContext.Roles.AnyAsync(role => role.Name == request.Name, cancellationToken);

        return !await _dbContext.Roles.AnyAsync(
            role => role.Name == request.Name && role.Id != request.Id,
            cancellationToken);
    }
}
