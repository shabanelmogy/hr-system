using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Context.Authentication;

namespace ErpSystem.Modules.Platform.Application.Features.CompanyGeography;

public interface ICompanyGeographicScopeStore
{
    Task<CompanyGeographicScopeResponse> GetAsync(int companyId, CancellationToken cancellationToken);
    Task<bool> AreActiveCountriesAsync(IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken);
    Task<bool> HasActiveAddressesOutsideScopeAsync(int companyId, IReadOnlyCollection<int> countryIds, CancellationToken cancellationToken);
    Task ReplaceAsync(int companyId, IReadOnlyCollection<int> countryIds, int defaultCountryId, int registrationCountryId, CancellationToken cancellationToken);
}

public sealed record GetCompanyGeographicScopeQuery : IQuery<Result<CompanyGeographicScopeResponse>>;

public sealed record UpdateCompanyGeographicScopeCommand(
    IReadOnlyList<int> CountryIds, int DefaultCountryId, int RegistrationCountryId)
    : ICommand<Result<CompanyGeographicScopeResponse>>;

public sealed class UpdateCompanyGeographicScopeCommandValidator : AbstractValidator<UpdateCompanyGeographicScopeCommand>
{
    public UpdateCompanyGeographicScopeCommandValidator()
    {
        RuleFor(command => command.CountryIds).NotEmpty().Must(ids => ids.Count <= 100).Must(ids => ids.Distinct().Count() == ids.Count);
        RuleForEach(command => command.CountryIds).GreaterThan(0);
        RuleFor(command => command.DefaultCountryId).GreaterThan(0).Must((command, id) => command.CountryIds.Contains(id));
        RuleFor(command => command.RegistrationCountryId).GreaterThan(0).Must((command, id) => command.CountryIds.Contains(id));
    }
}

public sealed class GetCompanyGeographicScopeQueryHandler(
    ICompanyGeographicScopeStore store, ICurrentActor actor)
    : IQueryHandler<GetCompanyGeographicScopeQuery, Result<CompanyGeographicScopeResponse>>
{
    public async Task<Result<CompanyGeographicScopeResponse>> Handle(GetCompanyGeographicScopeQuery request, CancellationToken cancellationToken)
    {
        if (actor.CompanyId is not > 0)
            return Result.Failure<CompanyGeographicScopeResponse>(new("CompanyGeographicScope.CompanyContextRequired", "A company context is required.", ErrorType.Validation));
        return Result.Success(await store.GetAsync(actor.CompanyId.Value, cancellationToken));
    }
}

public sealed class UpdateCompanyGeographicScopeCommandHandler(
    ICompanyGeographicScopeStore store, IUnitOfWork unitOfWork, ICurrentActor actor)
    : ICommandHandler<UpdateCompanyGeographicScopeCommand, Result<CompanyGeographicScopeResponse>>
{
    public async Task<Result<CompanyGeographicScopeResponse>> Handle(UpdateCompanyGeographicScopeCommand request, CancellationToken cancellationToken)
    {
        if (actor.CompanyId is not > 0 || string.IsNullOrWhiteSpace(actor.TenantId))
            return Result.Failure<CompanyGeographicScopeResponse>(new("CompanyGeographicScope.CompanyContextRequired", "A company context is required.", ErrorType.Validation));

        return await unitOfWork.ExecuteAtomicallyAsync(
            request.CountryIds.Select(id => $"reference-data:country:{id}").Append($"company-geographic-scope:{actor.TenantId}:{actor.CompanyId}").ToArray(),
            async token =>
            {
                if (!await store.AreActiveCountriesAsync(request.CountryIds, token))
                    return Result.Failure<CompanyGeographicScopeResponse>(new("CompanyGeographicScope.CountriesUnavailable", "One or more countries are unavailable.", ErrorType.Validation));
                if (await store.HasActiveAddressesOutsideScopeAsync(actor.CompanyId.Value, request.CountryIds, token))
                    return Result.Failure<CompanyGeographicScopeResponse>(new("CompanyGeographicScope.CountriesInUseByAddresses", "Active addresses exist outside the selected scope.", ErrorType.Conflict));
                await store.ReplaceAsync(actor.CompanyId.Value, request.CountryIds, request.DefaultCountryId, request.RegistrationCountryId, token);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(await store.GetAsync(actor.CompanyId.Value, token));
            }, cancellationToken);
    }
}
