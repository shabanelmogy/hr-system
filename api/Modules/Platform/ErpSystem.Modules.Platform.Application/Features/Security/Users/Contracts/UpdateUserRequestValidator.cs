namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
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
                 .WithMessage(_localizer[ValidationMessageKeys.Required])
                 .EmailAddress()
                 .WithMessage(_localizer[ValidationMessageKeys.InvalidEmail]);

            RuleFor(x => x.UserName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(2, 50)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

            RuleFor(x => x.FirstName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(3, 50)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

            RuleFor(x => x.LastName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(3, 50)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError]);

            RuleFor(x => x.Roles)
                .NotNull()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required]);

            RuleFor(x => x.Roles)
                .Must(x => x.Distinct().Count() == x.Count)
                .WithMessage(_localizer[ValidationMessageKeys.DuplicatedValue])
                .When(x => x.Roles != null);

            RuleFor(x => x.CompanyIds)
                .Cascade(CascadeMode.Stop)
                .NotNull()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Must(companyIds =>
                    companyIds.All(companyId => companyId > 0) &&
                    companyIds.Distinct().Count() == companyIds.Count)
                .WithMessage(_localizer[ValidationMessageKeys.InvalidValues]);

            RuleFor(x => x.DefaultCompanyId)
                .GreaterThan(0)
                .WithMessage(_localizer[ValidationMessageKeys.InvalidValues])
                .Must((request, defaultCompanyId) =>
                    request.CompanyIds?.Contains(defaultCompanyId) == true)
                .WithMessage(_localizer[ValidationMessageKeys.InvalidValues]);
        }
    }
}
