namespace HrManagementSystem.Application.Features.Security.Authentication.Contracts;

public sealed record TenantOptionResponse(
    string Id,
    string Identifier,
    string Name);

public sealed record TenantSelectionRequiredResponse(
    bool IsAuthenticated,
    bool RequiresTenantSelection,
    string TenantSelectionToken,
    DateTime TenantSelectionTokenExpiration,
    IReadOnlyCollection<TenantOptionResponse> Tenants);

public sealed record SelectTenantRequest(
    string TenantSelectionToken,
    string TenantId);

public sealed class SelectTenantRequestValidator : AbstractValidator<SelectTenantRequest>
{
    public SelectTenantRequestValidator(IStringLocalizer<SelectTenantRequest> localizer)
    {
        RuleFor(request => request.TenantSelectionToken)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required]);

        RuleFor(request => request.TenantId)
            .NotEmpty()
            .MaximumLength(32)
            .WithMessage(localizer[Strings.Required]);
    }
}
