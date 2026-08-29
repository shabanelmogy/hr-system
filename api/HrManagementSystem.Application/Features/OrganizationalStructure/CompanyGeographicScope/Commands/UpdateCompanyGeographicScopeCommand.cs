using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation;

namespace HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Commands;

public sealed record UpdateCompanyGeographicScopeCommand(
    IReadOnlyList<int> CountryIds,
    int DefaultCountryId,
    int RegistrationCountryId)
    : ICommand<Result<CompanyGeographicScopeResponse>>;

public sealed class UpdateCompanyGeographicScopeCommandValidator
    : AbstractValidator<UpdateCompanyGeographicScopeCommand>
{
    public const int MaximumCountries = 100;

    public UpdateCompanyGeographicScopeCommandValidator(
        IStringLocalizer<UpdateCompanyGeographicScopeRequest> localizer)
    {
        RuleFor(command => command.CountryIds)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(localizer["CompanyCountriesRequired"])
            .Must(ids => ids.Count <= MaximumCountries)
            .WithMessage(localizer["CompanyCountriesLimitExceeded"])
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage(localizer["CompanyCountryIdsMustBeDistinct"]);

        RuleForEach(command => command.CountryIds)
            .GreaterThan(0)
            .WithMessage(localizer["CompanyCountryIdsMustBePositive"]);

        RuleFor(command => command.DefaultCountryId)
            .GreaterThan(0)
            .Must((command, defaultCountryId) => command.CountryIds.Contains(defaultCountryId))
            .WithMessage(localizer["CompanyDefaultCountryMustBeSelected"]);

        RuleFor(command => command.RegistrationCountryId)
            .GreaterThan(0)
            .Must((command, registrationCountryId) => command.CountryIds.Contains(registrationCountryId))
            .WithMessage(localizer["CompanyRegistrationCountryMustBeSelected"]);
    }
}

public sealed class UpdateCompanyGeographicScopeCommandHandler(
    ICompanyGeographicScopeStore store,
    IUnitOfWork unitOfWork,
    ICurrentActor currentActor,
    CompanyGeographicScopeErrors errors)
    : ICommandHandler<UpdateCompanyGeographicScopeCommand, Result<CompanyGeographicScopeResponse>>
{
    public async Task<Result<CompanyGeographicScopeResponse>> Handle(
        UpdateCompanyGeographicScopeCommand request,
        CancellationToken cancellationToken)
    {
        if (!currentActor.CompanyId.HasValue || string.IsNullOrWhiteSpace(currentActor.TenantId))
            return Result.Failure<CompanyGeographicScopeResponse>(errors.CompanyContextRequired);

        var companyId = currentActor.CompanyId.Value;
        var lockResources = request.CountryIds
            .Select(GeographicalLifecycleLocks.Country)
            .Append($"company-geographic-scope:{currentActor.TenantId}:{companyId}")
            .ToArray();

        return await unitOfWork.ExecuteAtomicallyAsync(
            lockResources,
            async token =>
            {
                if (!await store.AreActiveCountriesAsync(request.CountryIds, token))
                    return Result.Failure<CompanyGeographicScopeResponse>(errors.CountriesUnavailable);

                // Clear the old default first so the filtered unique index can never
                // observe two active defaults while the replacement is saved.
                await store.ClearDefaultAsync(companyId, token);
                await unitOfWork.SaveChangesAsync(token);

                await store.ReplaceAsync(
                    companyId,
                    request.CountryIds,
                    request.DefaultCountryId,
                    request.RegistrationCountryId,
                    token);
                await unitOfWork.SaveChangesAsync(token);

                return Result.Success(await store.GetAsync(companyId, token));
            },
            cancellationToken);
    }
}
