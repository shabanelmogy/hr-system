namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
{
    public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
    {
        public CreateUserRequestValidator()
        {
            RuleFor(x => x.Email)
                .Trimmed()
                .NotEmpty()
                .WithMessage(ValidationMessageKeys.Required)
                .EmailAddress()
                .WithMessage(ValidationMessageKeys.InvalidEmail);

            RuleFor(x => x.UserName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(ValidationMessageKeys.Required)
                .Length(2, 50)
                .WithMessage(ValidationMessageKeys.MaxLengthError);

            RuleFor(x => x.Password)
                .Trimmed()
                .NotEmpty()
                .WithMessage(ValidationMessageKeys.Required)
                .Matches(ValidationPatterns.Password)
                .WithMessage(ValidationMessageKeys.InvalidPassword)
                .Length(8, 50)
                .WithMessage(ValidationMessageKeys.MaxLengthError);

            RuleFor(x => x.FirstName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(ValidationMessageKeys.Required)
                .Length(3, 50)
                .WithMessage(ValidationMessageKeys.MaxLengthError);

            RuleFor(x => x.LastName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(ValidationMessageKeys.Required)
                .Length(3, 50)
                .WithMessage(ValidationMessageKeys.MaxLengthError);

            RuleFor(x => x.Roles)
                .NotNull()
                .NotEmpty()
                .WithMessage(ValidationMessageKeys.Required);

            RuleFor(x => x.Roles)
                .Must(x => x.Distinct().Count() == x.Count)
                .WithMessage(ValidationMessageKeys.DuplicatedValue)
                .When(x => x.Roles != null);

            RuleFor(x => x.CompanyIds)
                .Cascade(CascadeMode.Stop)
                .NotNull()
                .NotEmpty()
                .WithMessage(ValidationMessageKeys.Required)
                .Must(companyIds =>
                    companyIds.All(companyId => companyId > 0) &&
                    companyIds.Distinct().Count() == companyIds.Count)
                .WithMessage(ValidationMessageKeys.InvalidValues);

            RuleFor(x => x.DefaultCompanyId)
                .GreaterThan(0)
                .WithMessage(ValidationMessageKeys.InvalidValues)
                .Must((request, defaultCompanyId) =>
                    request.CompanyIds?.Contains(defaultCompanyId) == true)
                .WithMessage(ValidationMessageKeys.InvalidValues);
        }
    }
}
