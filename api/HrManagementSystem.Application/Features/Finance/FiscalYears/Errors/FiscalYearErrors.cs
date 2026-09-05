using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Errors;

public sealed class FiscalYearErrors(IStringLocalizer<CreateFiscalYearRequest> localizer)
{
    public Error FiscalYearNotFound =>
        new("FiscalYear.NotFound", localizer[nameof(FiscalYearNotFound)], ErrorType.NotFound);

    public Error FiscalYearDuplicateCode =>
        new("FiscalYear.DuplicateCode", localizer[nameof(FiscalYearDuplicateCode)], ErrorType.Conflict);

    public Error FiscalYearOverlappingDates =>
        new("FiscalYear.OverlappingDates", localizer[nameof(FiscalYearOverlappingDates)], ErrorType.Conflict);

    public Error FiscalYearInvalidTransition =>
        new("FiscalYear.InvalidStatusTransition", localizer[nameof(FiscalYearInvalidTransition)], ErrorType.Validation);

    public Error FiscalYearNotEditable =>
        new("FiscalYear.NotEditable", localizer[nameof(FiscalYearNotEditable)], ErrorType.Validation);

    public Error FiscalYearNotArchivable =>
        new("FiscalYear.NotArchivable", localizer[nameof(FiscalYearNotArchivable)], ErrorType.Validation);

    public Error FiscalYearNotRestorable =>
        new("FiscalYear.NotRestorable", localizer[nameof(FiscalYearNotRestorable)], ErrorType.Validation);

    public Error FiscalYearCompanyContextRequired =>
        new("FiscalYear.CompanyContextRequired", localizer[nameof(FiscalYearCompanyContextRequired)], ErrorType.Forbidden);
}
