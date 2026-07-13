namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<UpdateProfileRequest> _localizer;

        public UpdateProfileRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<UpdateProfileRequest> localizer)
        {
            _dbContext = dbContext;
            _localizer = localizer;

            RuleFor(x => x.FirstName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(x => x.LastName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(x => x.UserName)
              .Trimmed()
              .NotEmpty()
              .WithMessage(_localizer[Strings.Required])
              .Length(3, 50)
              .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(c => c)
                .MustAsync(IsUserNameUniqueAsync)
               .WithMessage(_localizer[Strings.DuplicatedValue]);

        }

        private async Task<bool> IsUserNameUniqueAsync(UpdateProfileRequest profile, CancellationToken cancellationToken) =>
            !await _dbContext.Users.AnyAsync(
                user => user.UserName == profile.UserName && user.Id != profile.Id,
                cancellationToken);
    }
}
