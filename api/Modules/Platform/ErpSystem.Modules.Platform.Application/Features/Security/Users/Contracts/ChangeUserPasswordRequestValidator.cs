namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
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
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(8, 50)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
                .Matches(ValidationPatterns.Password)
                .WithMessage(_localizer[ValidationMessageKeys.InvalidPassword]);

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Equal(x => x.NewPassword)
                .WithMessage(_localizer[ValidationMessageKeys.InvalidValues]);
        }
    }
}
