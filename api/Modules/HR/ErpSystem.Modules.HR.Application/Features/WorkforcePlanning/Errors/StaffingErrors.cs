using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;

public sealed class StaffingErrors(IStringLocalizer<CreateStaffingRequestRequest> localizer)
{
    public Error NotFound => new("StaffingRequest.NotFound", localizer["StaffingRequestNotFound"], ErrorType.NotFound);
    public Error AmendmentNotFound => new("EnvelopeAmendment.NotFound", localizer["EnvelopeAmendmentNotFound"], ErrorType.NotFound);
    public Error EnvelopeNotFound => new("PositionEnvelope.NotFound", localizer["PositionEnvelopeNotFound"], ErrorType.NotFound);
    public Error FiscalYearNotFound => new("StaffingRequest.FiscalYearNotFound", localizer["StaffingRequestFiscalYearNotFound"], ErrorType.NotFound);
    public Error FiscalYearMustBeOpen => new("StaffingRequest.FiscalYearMustBeOpen", localizer["StaffingRequestFiscalYearMustBeOpen"], ErrorType.Validation);
    public Error CompanyContextRequired => new("StaffingRequest.CompanyContextRequired", localizer["StaffingRequestCompanyContextRequired"], ErrorType.Forbidden);
    public Error InvalidTransition => new("StaffingRequest.InvalidStatusTransition", localizer["StaffingRequestInvalidStatusTransition"], ErrorType.Validation);
    public Error AmendmentInvalidTransition => new("EnvelopeAmendment.InvalidStatusTransition", localizer["EnvelopeAmendmentInvalidStatusTransition"], ErrorType.Validation);
    public Error SelfApproval => new("StaffingRequest.SelfApproval", localizer["StaffingRequestSelfApproval"], ErrorType.Validation);
    public Error AmendmentSelfApproval => new("EnvelopeAmendment.SelfApproval", localizer["EnvelopeAmendmentSelfApproval"], ErrorType.Validation);
    public Error InsufficientHeadcount => new("PositionEnvelope.InsufficientHeadcount", localizer["PositionEnvelopeInsufficientHeadcount"], ErrorType.Validation);
    public Error InsufficientBudget => new("PositionEnvelope.InsufficientBudget", localizer["PositionEnvelopeInsufficientBudget"], ErrorType.Validation);
    public Error OverRelease => new("PositionEnvelope.OverRelease", localizer["PositionEnvelopeOverRelease"], ErrorType.Validation);
    public Error NegativeCapacity => new("PositionEnvelope.NegativeCapacity", localizer["PositionEnvelopeNegativeCapacity"], ErrorType.Unexpected);
    public Error ConcurrencyConflict => new("StaffingRequest.ConcurrencyConflict", localizer["StaffingRequestConcurrencyConflict"], ErrorType.Conflict);
    public Error TargetStartOutsideFiscalYear => new("StaffingRequest.TargetStartOutsideFiscalYear", localizer["StaffingRequestTargetStartOutsideFiscalYear"], ErrorType.Validation);
    public Error ActiveAllocations => new("StaffingRequest.ActiveAllocations", localizer["StaffingRequestActiveAllocations"], ErrorType.Validation);
    public Error InvalidCloseReason => new("StaffingRequest.InvalidCloseReason", localizer["StaffingRequestInvalidCloseReason"], ErrorType.Validation);
}
