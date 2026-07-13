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
                .Must(c => !IsUserNameDuplicated(c))
               .WithMessage(_localizer[Strings.DuplicatedValue]);

        }

        private bool IsUserNameDuplicated(UpdateProfileRequest profile)
        {
            var newCompany = _dbContext.Users.Any(c => c.UserName == profile.UserName && c.Id != profile.Id);
            return newCompany;
        }
    }
}