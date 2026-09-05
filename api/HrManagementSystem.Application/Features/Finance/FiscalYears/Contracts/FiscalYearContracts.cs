using HrManagementSystem.Domain.Finance.FiscalYears.Enums;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;

public abstract record FiscalYearMutation(
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodFrequency PeriodFrequency);

public sealed record CreateFiscalYearRequest(
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodFrequency PeriodFrequency)
    : FiscalYearMutation(Code, NameAr, NameEn, StartDate, EndDate, PeriodFrequency);

public sealed record UpdateFiscalYearRequest(
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodFrequency PeriodFrequency,
    string RowVersion)
    : FiscalYearMutation(Code, NameAr, NameEn, StartDate, EndDate, PeriodFrequency);

public sealed record FiscalYearConcurrencyRequest(string RowVersion);

public sealed record FiscalPeriodResponse(
    int Id,
    int Sequence,
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodStatus Status);

public sealed record FiscalYearListItemResponse(
    int Id,
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodFrequency PeriodFrequency,
    FiscalYearStatus Status,
    int PeriodsCount,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted,
    string RowVersion);

public sealed record FiscalYearDetailResponse(
    int Id,
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodFrequency PeriodFrequency,
    FiscalYearStatus Status,
    IReadOnlyList<FiscalPeriodResponse> Periods,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    bool IsDeleted,
    string RowVersion);

public sealed record FiscalYearLookupResponse(
    int Id,
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalYearStatus Status);
