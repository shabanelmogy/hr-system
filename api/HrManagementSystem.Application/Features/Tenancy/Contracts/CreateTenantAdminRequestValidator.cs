namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed class CreateTenantAdminRequestValidator : AbstractValidator<CreateTenantAdminRequest>
{
    public CreateTenantAdminRequestValidator()
    {
        RuleFor(request => request.FirstName)
            .Trimmed()
            .NotEmpty()
            .WithMessage(Strings.Required)
            .Length(3, 50)
            .WithMessage(Strings.MaxLengthError);

        RuleFor(request => request.LastName)
            .Trimmed()
            .NotEmpty()
            .WithMessage(Strings.Required)
            .Length(3, 50)
            .WithMessage(Strings.MaxLengthError);

        RuleFor(request => request.UserName)
            .Trimmed()
            .NotEmpty()
            .WithMessage(Strings.Required)
            .Length(2, 50)
            .WithMessage(Strings.MaxLengthError);

        RuleFor(request => request.Email)
            .Trimmed()
            .NotEmpty()
            .WithMessage(Strings.Required)
            .EmailAddress()
            .WithMessage(Strings.InvalidEmail)
            .MaximumLength(256);

        RuleFor(request => request.Password)
            .Trimmed()
            .NotEmpty()
            .WithMessage(Strings.Required)
            .Matches(RegexPattern.Password)
            .WithMessage(Strings.InvalidPassword)
            .Length(8, 50)
            .WithMessage(Strings.MaxLengthError);

        RuleFor(request => request.TenantIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .NotEmpty()
            .WithMessage(Strings.Required)
            .Must(tenantIds => tenantIds.Count <= 32 &&
                               tenantIds.All(tenantId => !string.IsNullOrWhiteSpace(tenantId)) &&
                               tenantIds.Distinct(StringComparer.Ordinal).Count() == tenantIds.Count)
            .WithMessage(Strings.InvalidValues);

        RuleForEach(request => request.TenantIds)
            .MaximumLength(32);

        RuleFor(request => request.DefaultTenantId)
            .NotEmpty()
            .WithMessage(Strings.Required)
            .MaximumLength(32)
            .Must((request, tenantId) =>
                request.TenantIds is not null &&
                request.TenantIds.Contains(tenantId, StringComparer.Ordinal))
            .WithMessage(Strings.InvalidValues);
    }
}
