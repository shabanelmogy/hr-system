namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        private readonly IStringLocalizer<RegisterRequest> _localizer;
        public RegisterRequestValidator(IStringLocalizer<RegisterRequest> localizer)
        {
            _localizer = localizer;

            RuleFor(r => r.Email)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .EmailAddress()
                .WithMessage(_localizer[Strings.InvalidEmail]);

            RuleFor(r => r.UserName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(r => r.FirstName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(r => r.LastName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(r => r.Password)
                .Trimmed()
                .NotEmpty()
                .Matches(RegexPattern.Password)
                .WithMessage(_localizer[Strings.InvalidPassword]);
        }
    }
}
