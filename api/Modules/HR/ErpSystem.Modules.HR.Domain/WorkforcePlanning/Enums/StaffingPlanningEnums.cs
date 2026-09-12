namespace ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

public enum EnvelopeAmendmentStatus
{
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    Rejected = 4
}

public enum StaffingRequestStatus
{
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    Rejected = 4,
    Closed = 5
}

public enum StaffingRequestType
{
    NewHire = 1,
    Replacement = 2
}

public enum StaffingRequestPriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4
}

public enum StaffingRequestCloseReason
{
    Fulfilled = 1,
    Cancelled = 2,
    PartiallyFulfilledCancelled = 3
}
