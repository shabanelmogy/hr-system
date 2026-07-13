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
            .Must(r => IsRoleNameDuplicated(r))
            .WithMessage(_localizer[Strings.RoleDuplicated]);
    }

    private bool IsRoleNameDuplicated(RoleRequest request)
    {
        // If no ID (new record), check if name exists
        if (string.IsNullOrEmpty(request.Id))
        {
            return !_dbContext.Roles.Any(c => c.Name == request.Name);
        }

        // If has ID (update), check if name exists for different record
        return !_dbContext.Roles.Any(c => c.Name == request.Name && c.Id != request.Id);
    }
}
