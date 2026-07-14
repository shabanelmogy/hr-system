namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public class ChangeUserPasswordRequestValidator : AbstractValidator<ChangeUserPasswordRequest>
    {
        private readonly IStringLocalizer<ChangeUserPasswordRequestValidator> _localizer;

        public ChangeUserPasswordRequestValidator(IStringLocalizer<ChangeUserPasswordRequestValidator> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x.NewPassword)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(8, 50)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Matches(RegexPattern.Password)
                .WithMessage(_localizer[Strings.InvalidPassword]);

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Equal(x => x.NewPassword)
                .WithMessage(_localizer[Strings.InvalidValues]);
        }
    }
}
