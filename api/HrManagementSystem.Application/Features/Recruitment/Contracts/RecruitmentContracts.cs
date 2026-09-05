using HrManagementSystem.Domain.Recruitment.Enums;

namespace HrManagementSystem.Application.Features.Recruitment.Contracts;

// --- Candidate Contracts ---
public sealed record CandidateDto
{
    public int Id { get; init; }
    public Guid PublicId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public int? NationalityCountryId { get; init; }
    public string? NationalityCountryNameEn { get; init; }
    public string? NationalityCountryNameAr { get; init; }
    public int? CurrentCountryId { get; init; }
    public int? CurrentStateId { get; init; }
    public string? City { get; init; }
    public string? LinkedInUrl { get; init; }
    public string? PortfolioUrl { get; init; }
    public int? ResumeFileId { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedOn { get; init; }
}

public sealed record CandidateMutation(
    string FirstName,
    string? MiddleName,
    string LastName,
    string Email,
    string? PhoneNumber = null,
    DateOnly? DateOfBirth = null,
    int? NationalityCountryId = null,
    int? CurrentCountryId = null,
    int? CurrentStateId = null,
    string? City = null,
    string? LinkedInUrl = null,
    string? PortfolioUrl = null,
    int? ResumeFileId = null);

// --- Job Requisition Contracts ---
public sealed record PositionHeadcountSummaryDto(
    int PositionId,
    string PositionCode,
    string JobTitleEn,
    string JobTitleAr,
    int TargetHeadcount,
    int ActiveHeadcount,
    int PendingRequisitionsCount,
    int AvailableHeadcount,
    bool ExceedsHeadcount);

public sealed record JobRequisitionDto
{
    public int Id { get; init; }
    public string RequisitionNumber { get; init; } = string.Empty;
    public int PositionId { get; init; }
    public string PositionTitleEn { get; init; } = string.Empty;
    public string PositionTitleAr { get; init; } = string.Empty;
    public int BranchId { get; init; }
    public string BranchNameEn { get; init; } = string.Empty;
    public string BranchNameAr { get; init; } = string.Empty;
    public int DepartmentId { get; init; }
    public string DepartmentNameEn { get; init; } = string.Empty;
    public string DepartmentNameAr { get; init; } = string.Empty;
    public int? DivisionId { get; init; }
    public string? DivisionNameEn { get; init; }
    public string? DivisionNameAr { get; init; }
    public int RequestedByEmployeeId { get; init; }
    public int RequestedPositions { get; init; }
    public string BusinessReason { get; init; } = string.Empty;
    public EmploymentType EmploymentType { get; init; }
    public WorkArrangement WorkArrangement { get; init; }
    public DateOnly? TargetHireDate { get; init; }
    public RequisitionType Type { get; init; } = RequisitionType.NewPosition;
    public int? ReplacementEmployeeId { get; init; }
    public string? ReplacementEmployeeName { get; init; }
    public bool IsBudgeted { get; init; } = true;
    public string? BudgetJustification { get; init; }
    public JobRequisitionStatus Status { get; init; }
    public DateTimeOffset? SubmittedOn { get; init; }
    public int? ReviewedByEmployeeId { get; init; }
    public DateTimeOffset? ReviewedOn { get; init; }
    public string? DecisionReason { get; init; }
    public DateTime CreatedOn { get; init; }
}

public sealed record JobRequisitionMutation(
    int PositionId,
    int BranchId,
    int DepartmentId,
    int? DivisionId,
    int RequestedPositions,
    string BusinessReason,
    EmploymentType EmploymentType,
    WorkArrangement WorkArrangement,
    DateOnly? TargetHireDate,
    RequisitionType Type = RequisitionType.NewPosition,
    int? ReplacementEmployeeId = null,
    bool? IsBudgeted = null,
    string? BudgetJustification = null);

// --- Job Opening Contracts ---
public sealed record JobOpeningDto
{
    public int Id { get; init; }
    public Guid PublicId { get; init; }
    public string OpeningNumber { get; init; } = string.Empty;
    public int JobRequisitionId { get; init; }
    public int PositionId { get; init; }
    public string PositionTitleEn { get; init; } = string.Empty;
    public string PositionTitleAr { get; init; } = string.Empty;
    public int BranchId { get; init; }
    public string BranchNameEn { get; init; } = string.Empty;
    public string BranchNameAr { get; init; } = string.Empty;
    public int DepartmentId { get; init; }
    public string DepartmentNameEn { get; init; } = string.Empty;
    public string DepartmentNameAr { get; init; } = string.Empty;
    public int? DivisionId { get; init; }
    public string? DivisionNameEn { get; init; }
    public string? DivisionNameAr { get; init; }
    public int PositionCount { get; init; }
    public int HiredCount { get; init; }
    public int AvailablePositions { get; init; }
    public EmploymentType EmploymentType { get; init; }
    public WorkArrangement WorkArrangement { get; init; }
    public JobOpeningStatus Status { get; init; }
    public DateTimeOffset? OpenedOn { get; init; }
    public DateTimeOffset? ClosedOn { get; init; }
    public string? ClosureReason { get; init; }
    public DateTime CreatedOn { get; init; }
    public int ActiveApplicationsCount { get; init; }
    public int? JobDescriptionId { get; init; }
    public IReadOnlyList<JobSkillDto> Skills { get; init; } = [];
}

public sealed record JobOpeningMutation(
    int JobRequisitionId,
    int PositionId,
    int BranchId,
    int DepartmentId,
    int? DivisionId,
    int PositionCount,
    EmploymentType EmploymentType,
    WorkArrangement WorkArrangement);

// --- Job Posting Contracts ---
public sealed record JobPostingDto
{
    public int Id { get; init; }
    public Guid PublicId { get; init; }
    public int JobOpeningId { get; init; }
    public string OpeningNumber { get; init; } = string.Empty;
    public string PositionTitleEn { get; init; } = string.Empty;
    public string PositionTitleAr { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public JobPostingAudience Audience { get; init; }
    public string TitleEn { get; init; } = string.Empty;
    public string TitleAr { get; init; } = string.Empty;
    public string? DescriptionEn { get; init; }
    public string? DescriptionAr { get; init; }
    public string? ResponsibilitiesEn { get; init; }
    public string? ResponsibilitiesAr { get; init; }
    public string? RequirementsEn { get; init; }
    public string? RequirementsAr { get; init; }
    public string? LocationTextEn { get; init; }
    public string? LocationTextAr { get; init; }
    public JobPostingStatus Status { get; init; }
    public DateTimeOffset? ScheduledPublishOn { get; init; }
    public DateTimeOffset? PublishedOn { get; init; }
    public DateTimeOffset? ClosesOn { get; init; }
    public DateTimeOffset? ClosedOn { get; init; }
    public DateTime CreatedOn { get; init; }
}

public sealed record JobPostingMutation(
    int JobOpeningId,
    string Slug,
    JobPostingAudience Audience,
    string TitleEn,
    string TitleAr,
    string? DescriptionEn,
    string? DescriptionAr,
    string? ResponsibilitiesEn,
    string? ResponsibilitiesAr,
    string? RequirementsEn,
    string? RequirementsAr,
    string? LocationTextEn,
    string? LocationTextAr,
    DateTimeOffset? ScheduledPublishOn = null,
    DateTimeOffset? ClosesOn = null);

// --- Employment Application Contracts ---
public sealed record ApplicationStatusHistoryDto
{
    public long Id { get; init; }
    public ApplicationStatus? FromStatus { get; init; }
    public ApplicationStatus ToStatus { get; init; }
    public DateTimeOffset ChangedOn { get; init; }
    public string? Reason { get; init; }
    public int? ChangedByEmployeeId { get; init; }
}

public sealed record EmploymentApplicationDto
{
    public int Id { get; init; }
    public Guid PublicId { get; init; }
    public int CandidateId { get; init; }
    public string CandidateName { get; init; } = string.Empty;
    public string CandidateEmail { get; init; } = string.Empty;
    public string? CandidatePhone { get; init; }
    public int JobOpeningId { get; init; }
    public string OpeningNumber { get; init; } = string.Empty;
    public string PositionTitleEn { get; init; } = string.Empty;
    public string PositionTitleAr { get; init; } = string.Empty;
    public string DepartmentNameEn { get; init; } = string.Empty;
    public string DepartmentNameAr { get; init; } = string.Empty;
    public string BranchNameEn { get; init; } = string.Empty;
    public string BranchNameAr { get; init; } = string.Empty;
    public int? JobPostingId { get; init; }
    public ApplicationSource Source { get; init; }
    public ApplicationStatus Status { get; init; }
    public string? CoverLetter { get; init; }
    public int? ResumeFileId { get; init; }
    public decimal? ExpectedSalary { get; init; }
    public string? ExpectedSalaryCurrencyCode { get; init; }
    public DateOnly? AvailableFrom { get; init; }
    public DateTimeOffset? SubmittedOn { get; init; }
    public DateTimeOffset LastStatusChangedOn { get; init; }
    public int? EmployeeId { get; init; }
    public int InterviewsCount { get; init; }
    public decimal? AverageEvaluationScore { get; init; }
    public IReadOnlyList<ApplicationStatusHistoryDto> StatusHistory { get; init; } = [];
}

public sealed record SubmitApplicationMutation(
    int CandidateId,
    int JobOpeningId,
    ApplicationSource Source,
    int? JobPostingId = null,
    string? CoverLetter = null,
    int? ResumeFileId = null,
    decimal? ExpectedSalary = null,
    string? ExpectedSalaryCurrencyCode = null,
    DateOnly? AvailableFrom = null);

// --- Interview Contracts ---
public sealed record InterviewParticipantDto
{
    public long Id { get; init; }
    public int EmployeeId { get; init; }
    public string EmployeeName { get; init; } = string.Empty;
    public bool IsLead { get; init; }
}

public sealed record JobSkillDto(
    string SkillName,
    string ProficiencyLevel,
    bool IsMandatory,
    int DefaultWeightPercentage = 0);

public sealed record InterviewSkillEvaluationDto(
    string SkillName,
    int Score,
    int? WeightPercentage,
    bool IsMandatory,
    string? Notes = null);

public sealed record InterviewEvaluationDto
{
    public long Id { get; init; }
    public int InterviewerEmployeeId { get; init; }
    public string InterviewerName { get; init; } = string.Empty;
    public decimal Score { get; init; }
    public InterviewRecommendation Recommendation { get; init; }
    public string? Comments { get; init; }
    public DateTimeOffset SubmittedOn { get; init; }
    public string? SkillEvaluationsJson { get; init; }
    public IReadOnlyList<InterviewSkillEvaluationDto> SkillEvaluations { get; init; } = [];
}

public sealed record InterviewScorecardTemplateDto(
    int InterviewId,
    int EmploymentApplicationId,
    string CandidateName,
    string PositionTitleEn,
    string PositionTitleAr,
    int? JobDescriptionId,
    IReadOnlyList<JobSkillDto> Skills);

public sealed record InterviewDto
{
    public int Id { get; init; }
    public int EmploymentApplicationId { get; init; }
    public string CandidateName { get; init; } = string.Empty;
    public string OpeningNumber { get; init; } = string.Empty;
    public string PositionTitleEn { get; init; } = string.Empty;
    public string PositionTitleAr { get; init; } = string.Empty;
    public InterviewType Type { get; init; }
    public InterviewStatus Status { get; init; }
    public DateTimeOffset StartsOn { get; init; }
    public DateTimeOffset EndsOn { get; init; }
    public DateTimeOffset? CompletedOn { get; init; }
    public string? LocationOrMeetingUrl { get; init; }
    public string? CancellationReason { get; init; }
    public IReadOnlyList<InterviewParticipantDto> Participants { get; init; } = [];
    public IReadOnlyList<InterviewEvaluationDto> Evaluations { get; init; } = [];
}

public sealed record ScheduleInterviewMutation(
    int EmploymentApplicationId,
    InterviewType Type,
    DateTimeOffset StartsOn,
    DateTimeOffset EndsOn,
    string? LocationOrMeetingUrl = null,
    int? LeadEmployeeId = null,
    IEnumerable<int>? ParticipantEmployeeIds = null);

public sealed record SubmitInterviewEvaluationMutation(
    decimal Score,
    InterviewRecommendation Recommendation,
    string? Comments = null,
    IEnumerable<InterviewSkillEvaluationDto>? SkillEvaluations = null);

// --- Job Offer Contracts ---
public sealed record JobOfferDto
{
    public int Id { get; init; }
    public Guid PublicId { get; init; }
    public string OfferNumber { get; init; } = string.Empty;
    public int EmploymentApplicationId { get; init; }
    public string CandidateName { get; init; } = string.Empty;
    public int PositionId { get; init; }
    public string PositionTitleEn { get; init; } = string.Empty;
    public string PositionTitleAr { get; init; } = string.Empty;
    public int BranchId { get; init; }
    public string BranchNameEn { get; init; } = string.Empty;
    public string BranchNameAr { get; init; } = string.Empty;
    public int DepartmentId { get; init; }
    public string DepartmentNameEn { get; init; } = string.Empty;
    public string DepartmentNameAr { get; init; } = string.Empty;
    public int? DivisionId { get; init; }
    public decimal BaseSalary { get; init; }
    public string CurrencyCode { get; init; } = string.Empty;
    public PayFrequency PayFrequency { get; init; }
    public EmploymentType EmploymentType { get; init; }
    public WorkArrangement WorkArrangement { get; init; }
    public DateOnly ProposedStartDate { get; init; }
    public string? TermsAndConditions { get; init; }
    public JobOfferStatus Status { get; init; }
    public DateTimeOffset? IssuedOn { get; init; }
    public DateTimeOffset? ExpiresOn { get; init; }
    public DateTimeOffset? RespondedOn { get; init; }
    public string? ResponseReason { get; init; }
    public DateTime CreatedOn { get; init; }
}

public sealed record JobOfferMutation(
    int EmploymentApplicationId,
    int PositionId,
    int BranchId,
    int DepartmentId,
    int? DivisionId,
    decimal BaseSalary,
    string CurrencyCode,
    PayFrequency PayFrequency,
    EmploymentType EmploymentType,
    WorkArrangement WorkArrangement,
    DateOnly ProposedStartDate,
    string? TermsAndConditions = null,
    DateTimeOffset? ExpiresOn = null);

// --- Recruitment Dashboard & Kanban ---
public sealed record RecruitmentDashboardSummaryDto
{
    public int TotalOpenings { get; init; }
    public int TotalActiveCandidates { get; init; }
    public int TotalScheduledInterviews { get; init; }
    public int TotalPendingOffers { get; init; }
    public int TotalHiredCount { get; init; }
    public IReadOnlyDictionary<string, int> StageCounts { get; init; } = new Dictionary<string, int>();
}

public sealed record HireCandidateMutation(
    string EmployeeNumber,
    DateOnly HireDate);

// --- Recruitment Settings Contracts ---
public sealed record RecruitmentSettingsDto
{
    public IReadOnlyList<RecruitmentStageDto> Stages { get; init; } = [];
    public IReadOnlyList<RejectionReasonDto> RejectionReasons { get; init; } = [];
    public IReadOnlyList<RecruitmentSourceDto> Sources { get; init; } = [];
    public IReadOnlyList<EvaluationCriterionDto> EvaluationCriteria { get; init; } = [];
    public RecruitmentGeneralSettingsDto General { get; init; } = new();
}

public sealed record RecruitmentStageDto(
    string Id,
    string NameAr,
    string NameEn,
    int Sequence,
    string Color,
    bool FoldedInKanban,
    bool IsDefault,
    bool SendEmailNotification,
    int MappedStatus,
    string? EmailTemplate = null);

public sealed record RejectionReasonDto(
    string Id,
    string ReasonAr,
    string ReasonEn,
    string Category,
    bool SendAutoEmail,
    string? EmailSubjectAr = null,
    string? EmailSubjectEn = null,
    string? EmailBodyAr = null,
    string? EmailBodyEn = null);

public sealed record RecruitmentSourceDto(
    string Id,
    string NameAr,
    string NameEn,
    string Type,
    bool IsActive,
    int ApplicationsCount,
    int HiredCount);

public sealed record EvaluationCriterionDto(
    string Id,
    string TitleAr,
    string TitleEn,
    string Category,
    decimal MaxScore,
    decimal Weight,
    bool IsMandatory,
    string? DescriptionAr = null,
    string? DescriptionEn = null);

public sealed record RecruitmentGeneralSettingsDto
{
    public string DefaultCurrency { get; init; } = "EGP";
    public int OfferExpiryDays { get; init; } = 7;
    public bool AutoPublishOpening { get; init; } = true;
    public bool EnforceHeadcountCapacity { get; init; } = true;
    public int DefaultProbationMonths { get; init; } = 3;
    public bool EnablePublicPortal { get; init; } = true;
    public string InboundEmailAlias { get; init; } = "careers@company.com";
}
