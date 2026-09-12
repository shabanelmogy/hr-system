using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;

public sealed record CreateEnvelopeAmendmentRequest(
    int EnvelopeId,
    int AdditionalHeadcount,
    decimal AdditionalSalaryCost,
    string Justification);

public sealed record EnvelopeAmendmentActionRequest(string RowVersion);
public sealed record RejectEnvelopeAmendmentRequest(string Reason, string RowVersion);

public sealed record EnvelopeAmendmentListItemResponse(
    int Id,
    int EnvelopeId,
    string EnvelopeCode,
    int AdditionalHeadcount,
    decimal AdditionalSalaryCost,
    EnvelopeAmendmentStatus Status,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record EnvelopeAmendmentDetailResponse(
    int Id,
    int EnvelopeId,
    string EnvelopeCode,
    int AdditionalHeadcount,
    decimal AdditionalSalaryCost,
    string Justification,
    EnvelopeAmendmentStatus Status,
    string? RequestedById,
    DateTimeOffset? SubmittedOn,
    string? SubmittedById,
    DateTimeOffset? ApprovedOn,
    string? ApprovedById,
    DateTimeOffset? RejectedOn,
    string? RejectedById,
    string? DecisionReason,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record CreateStaffingRequestRequest(
    int EnvelopeId,
    int RequestedHeadcount,
    decimal EstimatedAnnualSalaryPerSlot,
    DateOnly TargetStartDate,
    StaffingRequestType RequestType,
    StaffingRequestPriority Priority,
    string Justification);

public sealed record StaffingRequestActionRequest(string RowVersion);
public sealed record RejectStaffingRequestRequest(string Reason, string RowVersion);
public sealed record CloseStaffingRequestRequest(StaffingRequestCloseReason CloseReason, string RowVersion);

public sealed record StaffingRequestListItemResponse(
    int Id,
    int EnvelopeId,
    string EnvelopeCode,
    int RequestedHeadcount,
    decimal EstimatedAnnualSalaryPerSlot,
    decimal EstimatedFiscalYearCostPerSlot,
    decimal TotalReservedCost,
    DateOnly TargetStartDate,
    StaffingRequestType RequestType,
    StaffingRequestPriority Priority,
    StaffingRequestStatus Status,
    int RemainingAllocatable,
    int RemainingToHire,
    DateTime CreatedOn,
    string RowVersion);

public sealed record StaffingRequestDetailResponse(
    int Id,
    int EnvelopeId,
    string EnvelopeCode,
    int RequestedHeadcount,
    decimal EstimatedAnnualSalaryPerSlot,
    decimal EstimatedFiscalYearCostPerSlot,
    decimal TotalReservedCost,
    DateOnly TargetStartDate,
    StaffingRequestType RequestType,
    StaffingRequestPriority Priority,
    string Justification,
    string CurrencyCode,
    string CalculationPolicyVersion,
    int AllocatedRequisitionPositions,
    int HiredPositions,
    int RemainingAllocatable,
    int RemainingToHire,
    StaffingRequestStatus Status,
    StaffingRequestCloseReason? CloseReason,
    DateTimeOffset? SubmittedOn,
    string? SubmittedById,
    DateTimeOffset? ApprovedOn,
    string? ApprovedById,
    DateTimeOffset? RejectedOn,
    string? RejectedById,
    string? DecisionReason,
    DateTimeOffset? ClosedOn,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);
