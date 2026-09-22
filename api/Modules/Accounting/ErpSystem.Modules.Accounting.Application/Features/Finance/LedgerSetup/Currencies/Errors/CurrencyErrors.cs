using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Errors;

public sealed class CurrencyErrors(IStringLocalizer<CreateCurrencyRequest> localizer)
{
    public Error NotFound =>
        new("Currency.NotFound", localizer["CurrencyNotFound"], ErrorType.NotFound);

    public Error DuplicateCode =>
        new("Currency.DuplicateCode", localizer["CurrencyDuplicateCode"], ErrorType.Conflict);

    public Error CompanyContextRequired =>
        new("Currency.CompanyContextRequired", localizer["CurrencyCompanyContextRequired"], ErrorType.Forbidden);

    public Error InUse =>
        new("Currency.InUse", localizer["CurrencyInUse"], ErrorType.Conflict);

}
