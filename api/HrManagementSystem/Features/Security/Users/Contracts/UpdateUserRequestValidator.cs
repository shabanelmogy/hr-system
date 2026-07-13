namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
    {
        private readonly IStringLocalizer<UpdateUserRequestValidator> _localizer;
        public UpdateUserRequestValidator(IStringLocalizer<UpdateUserRequestValidator> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x.Email)
                 .Trimmed()
                 .NotEmpty()
                 .WithMessage(_localizer[Strings.Required])
                 .EmailAddress()
                 .WithMessage(_localizer[Strings.InvalidEmail]);

            RuleFor(x => x.UserName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(2, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

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

            RuleFor(x => x.Roles)
                .NotNull()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required]);

            RuleFor(x => x.Roles)
                .Must(x => x.Distinct().Count() == x.Count)
                .WithMessage(_localizer[Strings.DuplicatedValue])
                .When(x => x.Roles != null);
        }
    }
}