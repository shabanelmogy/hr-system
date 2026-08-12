namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
    {
        public CreateUserRequestValidator()
        {
            RuleFor(x => x.Email)
                .Trimmed()
                .NotEmpty()
                .WithMessage(Strings.Required)
                .EmailAddress()
                .WithMessage(Strings.InvalidEmail);

            RuleFor(x => x.UserName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(Strings.Required)
                .Length(2, 50)
                .WithMessage(Strings.MaxLengthError);

            RuleFor(x => x.Password)
                .Trimmed()
                .NotEmpty()
                .WithMessage(Strings.Required)
                .Matches(RegexPattern.Password)
                .WithMessage(Strings.InvalidPassword)
                .Length(8, 50)
                .WithMessage(Strings.MaxLengthError);

            RuleFor(x => x.FirstName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(Strings.Required)
                .Length(3, 50)
                .WithMessage(Strings.MaxLengthError);

            RuleFor(x => x.LastName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(Strings.Required)
                .Length(3, 50)
                .WithMessage(Strings.MaxLengthError);

            RuleFor(x => x.Roles)
                .NotNull()
                .NotEmpty()
                .WithMessage(Strings.Required);

            RuleFor(x => x.Roles)
                .Must(x => x.Distinct().Count() == x.Count)
                .WithMessage(Strings.DuplicatedValue)
                .When(x => x.Roles != null);

            RuleFor(x => x.CompanyIds)
                .Cascade(CascadeMode.Stop)
                .NotNull()
                .NotEmpty()
                .WithMessage(Strings.Required)
                .Must(companyIds =>
                    companyIds.All(companyId => companyId > 0) &&
                    companyIds.Distinct().Count() == companyIds.Count)
                .WithMessage(Strings.InvalidValues);

            RuleFor(x => x.DefaultCompanyId)
                .GreaterThan(0)
                .WithMessage(Strings.InvalidValues)
                .Must((request, defaultCompanyId) =>
                    request.CompanyIds?.Contains(defaultCompanyId) == true)
                .WithMessage(Strings.InvalidValues);
        }
    }
}
