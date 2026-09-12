using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;

public sealed class WorkforceBudgetErrors(IStringLocalizer<CreateWorkforceBudgetRequest> localizer)
{
    public Error NotFound => new("WorkforceBudget.NotFound", localizer["WorkforceBudgetNotFound"], ErrorType.NotFound);
    public Error DuplicateCode => new("WorkforceBudget.DuplicateCode", localizer["WorkforceBudgetDuplicateCode"], ErrorType.Conflict);
    public Error DuplicatePlan => new("WorkforceBudget.DuplicatePlan", localizer["WorkforceBudgetDuplicatePlan"], ErrorType.Conflict);
    public Error PlanNotFound => new("WorkforceBudget.PlanNotFound", localizer["WorkforceBudgetPlanNotFound"], ErrorType.NotFound);
    public Error PlanNotApproved => new("WorkforceBudget.PlanNotApproved", localizer["WorkforceBudgetPlanNotApproved"], ErrorType.Validation);
    public Error FiscalYearNotFound => new("WorkforceBudget.FiscalYearNotFound", localizer["WorkforceBudgetFiscalYearNotFound"], ErrorType.NotFound);
    public Error FiscalYearNotEditable => new("WorkforceBudget.FiscalYearNotEditable", localizer["WorkforceBudgetFiscalYearNotEditable"], ErrorType.Validation);
    public Error FiscalYearMustBeOpen => new("WorkforceBudget.FiscalYearMustBeOpen", localizer["WorkforceBudgetFiscalYearMustBeOpen"], ErrorType.Validation);
    public Error IncompleteLines => new("WorkforceBudget.IncompleteLines", localizer["WorkforceBudgetIncompleteLines"], ErrorType.Validation);
    public Error DuplicateLine => new("WorkforceBudget.DuplicateLine", localizer["WorkforceBudgetDuplicateLine"], ErrorType.Conflict);
    public Error ForeignLine => new("WorkforceBudget.ForeignLine", localizer["WorkforceBudgetForeignLine"], ErrorType.Validation);
    public Error HeadcountCeiling => new("WorkforceBudget.HeadcountCeiling", localizer["WorkforceBudgetHeadcountCeiling"], ErrorType.Validation);
    public Error DuplicatePeriod => new("WorkforceBudget.DuplicatePeriod", localizer["WorkforceBudgetDuplicatePeriod"], ErrorType.Validation);
    public Error PeriodNotFound => new("WorkforceBudget.PeriodNotFound", localizer["WorkforceBudgetPeriodNotFound"], ErrorType.Validation);
    public Error PeriodHeadcountCeiling => new("WorkforceBudget.PeriodHeadcountCeiling", localizer["WorkforceBudgetPeriodHeadcountCeiling"], ErrorType.Validation);
    public Error HeadcountMismatch => new("WorkforceBudget.HeadcountMismatch", localizer["WorkforceBudgetHeadcountMismatch"], ErrorType.Validation);
    public Error SalaryMismatch => new("WorkforceBudget.SalaryMismatch", localizer["WorkforceBudgetSalaryMismatch"], ErrorType.Validation);
    public Error RecruitmentMismatch => new("WorkforceBudget.RecruitmentMismatch", localizer["WorkforceBudgetRecruitmentMismatch"], ErrorType.Validation);
    public Error EnvelopeGenerationFailed => new("WorkforceBudget.EnvelopeGenerationFailed", localizer["WorkforceBudgetEnvelopeGenerationFailed"], ErrorType.Unexpected);
    public Error CompanyContextRequired => new("WorkforceBudget.CompanyContextRequired", localizer["WorkforceBudgetCompanyContextRequired"], ErrorType.Forbidden);
    public Error InvalidTransition => new("WorkforceBudget.InvalidStatusTransition", localizer["WorkforceBudgetInvalidStatusTransition"], ErrorType.Validation);
    public Error ConcurrencyConflict => new("WorkforceBudget.ConcurrencyConflict", localizer["WorkforceBudgetConcurrencyConflict"], ErrorType.Conflict);
    public Error EnvelopeNotFound => new("PositionEnvelope.NotFound", localizer["PositionEnvelopeNotFound"], ErrorType.NotFound);
}
