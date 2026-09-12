using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;

public sealed class WorkforcePlanErrors(IStringLocalizer<CreateWorkforcePlanRequest> localizer)
{
    public Error NotFound => new("WorkforcePlan.NotFound", localizer["WorkforcePlanNotFound"], ErrorType.NotFound);
    public Error DuplicateCode => new("WorkforcePlan.DuplicateCode", localizer["WorkforcePlanDuplicateCode"], ErrorType.Conflict);
    public Error FiscalYearNotFound => new("WorkforcePlan.FiscalYearNotFound", localizer["WorkforcePlanFiscalYearNotFound"], ErrorType.NotFound);
    public Error FiscalYearMustBeOpen => new("WorkforcePlan.FiscalYearMustBeOpen", localizer["WorkforcePlanFiscalYearMustBeOpen"], ErrorType.Validation);
    public Error FiscalYearNotEditable => new("WorkforcePlan.FiscalYearNotEditable", localizer["WorkforcePlanFiscalYearNotEditable"], ErrorType.Validation);
    public Error PositionNotFound => new("WorkforcePlan.PositionNotFound", localizer["WorkforcePlanPositionNotFound"], ErrorType.NotFound);
    public Error BranchNotFound => new("WorkforcePlan.BranchNotFound", localizer["WorkforcePlanBranchNotFound"], ErrorType.NotFound);
    public Error DuplicateLine => new("WorkforcePlan.DuplicateLine", localizer["WorkforcePlanDuplicateLine"], ErrorType.Conflict);
    public Error PositionBranchMismatch => new("WorkforcePlan.PositionBranchMismatch", localizer["WorkforcePlanPositionBranchMismatch"], ErrorType.Validation);
    public Error PeriodNotFound => new("WorkforcePlan.PeriodNotFound", localizer["WorkforcePlanPeriodNotFound"], ErrorType.Validation);
    public Error CompanyContextRequired => new("WorkforcePlan.CompanyContextRequired", localizer["WorkforcePlanCompanyContextRequired"], ErrorType.Forbidden);
    public Error InvalidTransition => new("WorkforcePlan.InvalidStatusTransition", localizer["WorkforcePlanInvalidStatusTransition"], ErrorType.Validation);
    public Error SelfApproval => new("WorkforcePlan.SelfApproval", localizer["WorkforcePlanSelfApproval"], ErrorType.Validation);
    public Error NotArchivable => new("WorkforcePlan.NotArchivable", localizer["WorkforcePlanNotArchivable"], ErrorType.Validation);
    public Error NotRestorable => new("WorkforcePlan.NotRestorable", localizer["WorkforcePlanNotRestorable"], ErrorType.Validation);
    public Error ConcurrencyConflict => new("WorkforcePlan.ConcurrencyConflict", localizer["WorkforcePlanConcurrencyConflict"], ErrorType.Conflict);

}
