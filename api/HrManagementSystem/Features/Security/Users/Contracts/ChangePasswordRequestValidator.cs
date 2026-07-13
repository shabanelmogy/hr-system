namespace HrManagementSystem.Features.Security.Users.Contracts
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
                .Matches(RegexPattern.Password)
                .WithMessage(Strings.InvalidPassword)
                .NotEqual(x => x.CurrentPassword)
                .WithMessage(Strings.InvalidNewPassword);
        }
    }
}