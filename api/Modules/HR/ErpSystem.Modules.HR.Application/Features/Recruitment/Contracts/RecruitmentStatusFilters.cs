namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;

// These enums are application-boundary inputs. Their numeric values and member
// names are intentionally kept compatible with the public HTTP query/body
// contract; Infrastructure maps them to the domain enums before querying or
// changing aggregates.
public enum JobRequisitionStatusFilter
{
    Draft = 1,
    PendingApproval = 2,
    Approved = 3,
    Rejected = 4,
    Cancelled = 5,
    Fulfilled = 6
}

public enum JobOpeningStatusFilter
{
    Draft = 1,
    Open = 2,
    Paused = 3,
    Filled = 4,
    Closed = 5,
    Cancelled = 6
}

public enum JobPostingStatusFilter
{
    Draft = 1,
    Scheduled = 2,
    Published = 3,
    Closed = 4,
    Archived = 5
}

public enum ApplicationStatusFilter
{
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Shortlisted = 4,
    InterviewScheduled = 5,
    Interviewed = 6,
    OfferIssued = 7,
    OfferAccepted = 8,
    OfferDeclined = 9,
    Rejected = 10,
    Withdrawn = 11,
    Hired = 12
}

public enum InterviewStatusFilter
{
    Scheduled = 1,
    Completed = 2,
    Cancelled = 3,
    NoShow = 4
}

public enum JobOfferStatusFilter
{
    Draft = 1,
    Issued = 2,
    Accepted = 3,
    Declined = 4,
    Withdrawn = 5,
    Expired = 6,
    PendingApproval = 7,
    Approved = 8
}
