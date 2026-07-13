namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public class ResendConfirmationEmailRequestValidator : AbstractValidator<ResendConfirmationEmailRequest>
    {
        private readonly IStringLocalizer<ResendConfirmationEmailRequest> _localizer;
        public ResendConfirmationEmailRequestValidator(IStringLocalizer<ResendConfirmationEmailRequest> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x.Email)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .EmailAddress()
                .WithMessage(_localizer[Strings.InvalidEmail]);
        }
    }
}