namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
    {
        private readonly IStringLocalizer<ResetPasswordRequest> _localizer;
        public ResetPasswordRequestValidator(IStringLocalizer<ResetPasswordRequest> localizer = null)
        {
            _localizer = localizer;

            RuleFor(x => x.Email)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .EmailAddress()
                .WithMessage(_localizer[Strings.InvalidEmail]);

            RuleFor(x => x.Code)
               .NotEmpty();

            RuleFor(x => x.NewPassword)
                .Trimmed()
                .NotEmpty()
                .Matches(RegexPattern.Password)
                .WithMessage(_localizer[Strings.InvalidNewPassword]);
        }
    }
}