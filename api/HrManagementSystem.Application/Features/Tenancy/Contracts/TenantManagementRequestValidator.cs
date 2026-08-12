using HrManagementSystem.Domain.Tenancy.Enums;

namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

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
    }
}
