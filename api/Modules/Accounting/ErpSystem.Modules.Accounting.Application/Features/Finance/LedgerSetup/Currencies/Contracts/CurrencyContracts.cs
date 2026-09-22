namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;

public abstract record CurrencyMutation(
    string CurrencyCode,
    string NameEn,
    string NameAr,
    string Symbol);

public sealed record CreateCurrencyRequest(
    string CurrencyCode,
    string NameEn,
    string NameAr,
    string Symbol)
    : CurrencyMutation(CurrencyCode, NameEn, NameAr, Symbol);

public sealed record UpdateCurrencyRequest(
    string CurrencyCode,
    string NameEn,
    string NameAr,
    string Symbol,
    string RowVersion)
    : CurrencyMutation(CurrencyCode, NameEn, NameAr, Symbol);

public sealed record CurrencyConcurrencyRequest(string RowVersion);

public sealed record CurrencyResponse(
    int Id,
    string CurrencyCode,
    string NameEn,
    string NameAr,
    string Symbol,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted,
    string RowVersion);

public sealed record CurrencyLookupResponse(
    int Id,
    string CurrencyCode,
    string NameEn,
    string NameAr,
    string Symbol);
