using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Context.Authentication;
namespace ErpSystem.Modules.HR.Application.Features.CurrencySnapshots;

public static class HrCurrencySnapshotErrors
{
    public static readonly Error CompanyContextRequired = new(
        "HR.Currency.CompanyContextRequired",
        "A tenant and company context is required to validate currency data.",
        ErrorType.Forbidden);

    public static readonly Error InvalidOrInactive = new(
        "HR.Currency.InvalidOrInactive",
        "The selected currency does not exist or is not active for the current company.",
        ErrorType.Validation);
}

public static class AccountingCurrencySnapshotValidation
{
    public static bool TryGetScope(ICurrentActor actor, out string tenantId, out int companyId)
    {
        tenantId = actor.TenantId ?? string.Empty;
        companyId = actor.CompanyId.GetValueOrDefault();
        return tenantId.Length > 0 && companyId > 0;
    }
}
