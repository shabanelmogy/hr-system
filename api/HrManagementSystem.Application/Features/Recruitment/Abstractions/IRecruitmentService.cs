using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Domain.Recruitment.Enums;

namespace HrManagementSystem.Application.Features.Recruitment.Abstractions;

public interface IRecruitmentService
{
    // Dashboard Summary
    Task<RecruitmentDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);

    // Candidates
    Task<PageResponse<CandidateDto>> GetCandidatesPageAsync(int pageNumber, int pageSize, string? search, CancellationToken cancellationToken = default);
    Task<Result<CandidateDto>> GetCandidateByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<CandidateDto>> CreateCandidateAsync(CandidateMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<CandidateDto>> UpdateCandidateAsync(int id, CandidateMutation mutation, CancellationToken cancellationToken = default);

    // Job Requisitions
    Task<PageResponse<JobRequisitionDto>> GetJobRequisitionsPageAsync(int pageNumber, int pageSize, string? search, JobRequisitionStatus? status, CancellationToken cancellationToken = default);
    Task<Result<JobRequisitionDto>> GetJobRequisitionByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PositionHeadcountSummaryDto>> GetPositionHeadcountSummaryAsync(int positionId, CancellationToken cancellationToken = default);
    Task<Result<JobRequisitionDto>> CreateJobRequisitionAsync(JobRequisitionMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<JobRequisitionDto>> SubmitJobRequisitionAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobRequisitionDto>> ApproveJobRequisitionAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobRequisitionDto>> RejectJobRequisitionAsync(int id, string reason, CancellationToken cancellationToken = default);

    // Job Openings
    Task<PageResponse<JobOpeningDto>> GetJobOpeningsPageAsync(int pageNumber, int pageSize, string? search, JobOpeningStatus? status, int? departmentId, CancellationToken cancellationToken = default);
    Task<Result<JobOpeningDto>> GetJobOpeningByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobOpeningDto>> CreateJobOpeningAsync(JobOpeningMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<JobOpeningDto>> OpenJobOpeningAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobOpeningDto>> PauseJobOpeningAsync(int id, string reason, CancellationToken cancellationToken = default);
    Task<Result<JobOpeningDto>> CloseJobOpeningAsync(int id, string reason, CancellationToken cancellationToken = default);

    // Job Postings
    Task<PageResponse<JobPostingDto>> GetJobPostingsPageAsync(int pageNumber, int pageSize, string? search, JobPostingStatus? status, CancellationToken cancellationToken = default);
    Task<Result<JobPostingDto>> GetJobPostingByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobPostingDto>> CreateJobPostingAsync(JobPostingMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<JobPostingDto>> UpdateJobPostingAsync(int id, JobPostingMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<JobPostingDto>> PublishJobPostingAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobPostingDto>> CloseJobPostingAsync(int id, CancellationToken cancellationToken = default);

    // Employment Applications
    Task<PageResponse<EmploymentApplicationDto>> GetApplicationsPageAsync(int pageNumber, int pageSize, string? search, int? jobOpeningId, ApplicationStatus? status, CancellationToken cancellationToken = default);
    Task<Result<EmploymentApplicationDto>> GetApplicationByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<EmploymentApplicationDto>> SubmitApplicationAsync(SubmitApplicationMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<EmploymentApplicationDto>> MoveApplicationStageAsync(int id, ApplicationStatus targetStatus, string? reason, CancellationToken cancellationToken = default);
    Task<Result<EmploymentApplicationDto>> RejectApplicationAsync(int id, string reason, CancellationToken cancellationToken = default);
    Task<Result<EmploymentApplicationDto>> WithdrawApplicationAsync(int id, string reason, CancellationToken cancellationToken = default);
    Task<Result<EmploymentApplicationDto>> HireApplicationAsync(int id, HireCandidateMutation mutation, CancellationToken cancellationToken = default);

    // Interviews
    Task<PageResponse<InterviewDto>> GetInterviewsPageAsync(int pageNumber, int pageSize, int? applicationId, InterviewStatus? status, CancellationToken cancellationToken = default);
    Task<Result<InterviewDto>> GetInterviewByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<InterviewDto>> ScheduleInterviewAsync(ScheduleInterviewMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<InterviewDto>> CancelInterviewAsync(int id, string reason, CancellationToken cancellationToken = default);
    Task<Result<InterviewDto>> CompleteInterviewAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<InterviewDto>> SubmitInterviewEvaluationAsync(int interviewId, SubmitInterviewEvaluationMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<InterviewScorecardTemplateDto>> GetInterviewScorecardTemplateAsync(int interviewId, CancellationToken cancellationToken = default);

    // Job Offers
    Task<PageResponse<JobOfferDto>> GetJobOffersPageAsync(int pageNumber, int pageSize, int? applicationId, JobOfferStatus? status, CancellationToken cancellationToken = default);
    Task<Result<JobOfferDto>> GetJobOfferByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobOfferDto>> CreateJobOfferAsync(JobOfferMutation mutation, CancellationToken cancellationToken = default);
    Task<Result<JobOfferDto>> IssueJobOfferAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobOfferDto>> AcceptJobOfferAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<JobOfferDto>> DeclineJobOfferAsync(int id, string reason, CancellationToken cancellationToken = default);

    // Recruitment Settings
    Task<RecruitmentSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task<RecruitmentSettingsDto> UpdateSettingsAsync(RecruitmentSettingsDto settings, CancellationToken cancellationToken = default);
}
