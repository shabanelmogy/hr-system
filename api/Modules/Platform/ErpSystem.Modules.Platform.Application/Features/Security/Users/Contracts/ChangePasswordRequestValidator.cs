namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
{
    public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
    {
        public ChangePasswordRequestValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .Trimmed()
                .NotEmpty();

            RuleFor(x => x.NewPassword)
                .Trimmed()
                .NotEmpty()
                .Matches(ValidationPatterns.Password)
                .WithMessage(ValidationMessageKeys.InvalidPassword)
                .NotEqual(x => x.CurrentPassword)
                .WithMessage(ValidationMessageKeys.InvalidNewPassword);
        }
    }
}