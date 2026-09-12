using ErpSystem.Modules.HR.Domain.Tenancy.Enums;

namespace ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;

public sealed class TenantManagementRequestValidator : AbstractValidator<TenantManagementRequest>
{
    public TenantManagementRequestValidator(IStringLocalizer<TenantManagementRequest> localizer)
    {
        RuleFor(request => request.Identifier)
            .NotEmpty()
            .MaximumLength(100)
            .Matches("^[a-zA-Z0-9][a-zA-Z0-9-]*$");

        RuleFor(request => request.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(request => request.SubscriptionStatus)
            .Must(status => Enum.TryParse<SubscriptionStatus>(status, true, out _))
            .WithMessage("Subscription status is invalid.");

        RuleFor(request => request.SubscriptionStartedOn)
            .NotEmpty();

        RuleFor(request => request.SubscriptionEndsOn)
            .NotNull()
            .WithMessage(localizer[Strings.Required])
            .GreaterThanOrEqualTo(request => request.SubscriptionStartedOn)
            .WithMessage(localizer[Strings.InvalidDate]);

        RuleFor(request => request.MaxAdmins)
            .GreaterThanOrEqualTo(1);

        RuleFor(request => request.MaxUsers)
            .GreaterThanOrEqualTo(0);

        RuleFor(request => request.PlanName).MaximumLength(100);
        RuleFor(request => request.BillingEmail).EmailAddress().MaximumLength(256)
            .When(request => !string.IsNullOrWhiteSpace(request.BillingEmail));
        RuleFor(request => request.ContactName).MaximumLength(200);
        RuleFor(request => request.ContactPhone).MaximumLength(32);
        RuleFor(request => request.Notes).MaximumLength(2000);
        When(request => request.Entitlements is not null, () =>
        {
            RuleFor(request => request.Entitlements!)
                .Must(items => items
                    .Select(item => item.ModuleCode?.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .Count() == items.Count)
                .WithMessage("Module entitlement codes must be unique.");

            RuleForEach(request => request.Entitlements!).ChildRules(module =>
            {
                module.RuleFor(item => item.ModuleCode)
                    .NotEmpty()
                    .MaximumLength(32)
                    .Matches("^[a-z][a-z0-9-]*$");
                module.RuleFor(item => item.SubmoduleCodes)
                    .Must(items => items is null || items
                        .Select(code => code?.Trim())
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .Count() == items.Count)
                    .WithMessage("Submodule entitlement codes must be unique.");
                module.RuleForEach(item => item.SubmoduleCodes!)
                    .NotEmpty()
                    .MaximumLength(32)
                    .Matches("^[a-z][a-z0-9-]*$")
                    .When(item => item.SubmoduleCodes is not null);
            });
        });
        RuleFor(request => request.RowVersion)
            .MaximumLength(64)
            .Must(value => string.IsNullOrWhiteSpace(value) || IsBase64(value))
            .WithMessage("Row version is invalid.");
    }

    private static bool IsBase64(string value)
    {
        Span<byte> buffer = stackalloc byte[value.Length];
        return Convert.TryFromBase64String(value, buffer, out _);
    }
}
