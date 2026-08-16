namespace HrManagementSystem.Application.Features.Security.Invitations.Contracts;

public sealed record CreateUserInvitationRequest(
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<int> CompanyIds,
    int DefaultCompanyId);

public sealed record AcceptUserInvitationRequest(Guid InvitationId, string Token, string Password);

public sealed record UserInvitationResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string UserName,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<int> CompanyIds,
    int DefaultCompanyId,
    string Status,
    DateTime ExpiresOn,
    DateTime CreatedOn,
    DateTime? AcceptedOn,
    DateTime? RevokedOn);

public sealed class CreateUserInvitationRequestValidator : AbstractValidator<CreateUserInvitationRequest>
{
    public CreateUserInvitationRequestValidator()
    {
        RuleFor(request => request.Email).Cascade(CascadeMode.Stop).Trimmed().NotEmpty().EmailAddress();
        RuleFor(request => request.UserName).Cascade(CascadeMode.Stop).Trimmed().NotEmpty().Length(2, 50);
        RuleFor(request => request.FirstName).Cascade(CascadeMode.Stop).Trimmed().NotEmpty().Length(3, 50);
        RuleFor(request => request.LastName).Cascade(CascadeMode.Stop).Trimmed().NotEmpty().Length(3, 50);
        RuleFor(request => request.Roles).Cascade(CascadeMode.Stop).NotNull().NotEmpty()
            .Must(roles => roles.Distinct(StringComparer.OrdinalIgnoreCase).Count() == roles.Count);
        RuleFor(request => request.CompanyIds).Cascade(CascadeMode.Stop).NotNull().NotEmpty().Must(companyIds =>
            companyIds.All(companyId => companyId > 0) && companyIds.Distinct().Count() == companyIds.Count);
        RuleFor(request => request.DefaultCompanyId).Cascade(CascadeMode.Stop).GreaterThan(0)
            .Must((request, companyId) => request.CompanyIds?.Contains(companyId) == true);
    }
}

public sealed class AcceptUserInvitationRequestValidator : AbstractValidator<AcceptUserInvitationRequest>
{
    public AcceptUserInvitationRequestValidator()
    {
        RuleFor(request => request.InvitationId).NotEmpty();
        RuleFor(request => request.Token).Cascade(CascadeMode.Stop).NotEmpty().MaximumLength(256);
        RuleFor(request => request.Password).Cascade(CascadeMode.Stop).Trimmed().NotEmpty().Matches(RegexPattern.Password).Length(8, 50);
    }
}
