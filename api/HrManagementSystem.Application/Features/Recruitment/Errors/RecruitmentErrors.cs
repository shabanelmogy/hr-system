using HrManagementSystem.Application.Common.Errors;

namespace HrManagementSystem.Application.Features.Recruitment.Errors;

public static class RecruitmentErrors
{
    public static readonly Error CandidateNotFound = new(
        "Recruitment.CandidateNotFound",
        "The requested candidate was not found.",
        ErrorType.NotFound);

    public static readonly Error CandidateEmailAlreadyExists = new(
        "Recruitment.CandidateEmailAlreadyExists",
        "A candidate with this email address already exists.",
        ErrorType.Conflict);

    public static readonly Error JobRequisitionNotFound = new(
        "Recruitment.JobRequisitionNotFound",
        "The requested job requisition was not found.",
        ErrorType.NotFound);

    public static readonly Error JobRequisitionNotApproved = new(
        "Recruitment.JobRequisitionNotApproved",
        "A job opening can only be created from an approved job requisition.",
        ErrorType.Validation);

    public static readonly Error JobOpeningNotFound = new(
        "Recruitment.JobOpeningNotFound",
        "The requested job opening was not found.",
        ErrorType.NotFound);

    public static readonly Error JobOpeningNotOpen = new(
        "Recruitment.JobOpeningNotOpen",
        "The job opening is not currently open for applications or hiring.",
        ErrorType.Validation);

    public static readonly Error JobPostingNotFound = new(
        "Recruitment.JobPostingNotFound",
        "The requested job posting was not found.",
        ErrorType.NotFound);

    public static readonly Error JobPostingSlugAlreadyExists = new(
        "Recruitment.JobPostingSlugAlreadyExists",
        "A job posting with this slug already exists.",
        ErrorType.Conflict);

    public static readonly Error EmploymentApplicationNotFound = new(
        "Recruitment.EmploymentApplicationNotFound",
        "The requested employment application was not found.",
        ErrorType.NotFound);

    public static readonly Error InterviewNotFound = new(
        "Recruitment.InterviewNotFound",
        "The requested interview was not found.",
        ErrorType.NotFound);

    public static readonly Error JobOfferNotFound = new(
        "Recruitment.JobOfferNotFound",
        "The requested job offer was not found.",
        ErrorType.NotFound);

    public static readonly Error CompanyContextRequired = new(
        "Recruitment.CompanyContextRequired",
        "A company context is required for recruitment operations.",
        ErrorType.Validation);

    public static readonly Error PositionNotFound = new(
        "Recruitment.PositionNotFound",
        "The specified position was not found.",
        ErrorType.NotFound);

    public static readonly Error BudgetJustificationRequired = new(
        "Recruitment.BudgetJustificationRequired",
        "A budget justification is required for unbudgeted job requisitions exceeding target headcount.",
        ErrorType.Validation);

    public static readonly Error ReplacementEmployeeRequired = new(
        "Recruitment.ReplacementEmployeeRequired",
        "A valid replacement employee is required for replacement job requisitions.",
        ErrorType.Validation);

    public static readonly Error InvalidOperation = new(
        "Recruitment.InvalidOperation",
        "The requested recruitment lifecycle operation is invalid in the current state.",
        ErrorType.Validation);
}
