namespace HrManagementSystem.Application.Features.Security.Authentication.Contracts;

public sealed record CompanyOptionResponse(
    int Id,
    string CompanyCode,
    string NameAr,
    string NameEn);

public sealed record CompanySelectionRequiredResponse(
    bool IsAuthenticated,
    bool RequiresCompanySelection,
    string CompanySelectionToken,
    DateTime CompanySelectionTokenExpiration,
    IReadOnlyCollection<CompanyOptionResponse> Companies);

public sealed record SelectCompanyRequest(
    string CompanySelectionToken,
    int CompanyId);

public sealed class SelectCompanyRequestValidator : AbstractValidator<SelectCompanyRequest>
{
    public SelectCompanyRequestValidator(IStringLocalizer<SelectCompanyRequest> localizer)
    {
        RuleFor(request => request.CompanySelectionToken)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required]);

        RuleFor(request => request.CompanyId)
            .GreaterThan(0)
            .WithMessage(localizer[Strings.Required]);
    }
}

public sealed record SwitchCompanyRequest(int CompanyId);

public sealed class SwitchCompanyRequestValidator : AbstractValidator<SwitchCompanyRequest>
{
    public SwitchCompanyRequestValidator(IStringLocalizer<SwitchCompanyRequest> localizer)
    {
        RuleFor(request => request.CompanyId)
            .GreaterThan(0)
            .WithMessage(localizer[Strings.Required]);
    }
}

public abstract record LoginResult
{
    public abstract object Payload { get; }
}

public sealed record AuthenticatedLoginResult(AuthResponse Response) : LoginResult
{
    public override object Payload => Response;
}

public sealed record CompanySelectionLoginResult(
    CompanySelectionRequiredResponse Response) : LoginResult
{
    public override object Payload => Response;
}

public sealed record TenantSelectionLoginResult(
    TenantSelectionRequiredResponse Response) : LoginResult
{
    public override object Payload => Response;
}
