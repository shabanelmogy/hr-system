namespace ErpSystem.Modules.HR.Contracts.Authorization;

public static class HrPermissions
{
    public const string ViewOrganizationalStructure = "OrganizationalStructure:View";
    public const string CreateOrganizationalStructure = "OrganizationalStructure:Create";
    public const string EditOrganizationalStructure = "OrganizationalStructure:Edit";
    public const string ArchiveOrganizationalStructure = "OrganizationalStructure:Archive";
    public const string RestoreOrganizationalStructure = "OrganizationalStructure:Restore";
    public const string ApproveJobDescriptions = "OrganizationalStructure:ApproveJobDescriptions";

    public const string ViewRecruitment = "Recruitment:View";
    public const string CreateJobRequisitions = "JobRequisitions:Create";
    public const string SubmitJobRequisitions = "JobRequisitions:Submit";
    public const string ReviewJobRequisitions = "JobRequisitions:Review";
    public const string CancelJobRequisitions = "JobRequisitions:Cancel";
    public const string CreateJobOpenings = "JobOpenings:Create";
    public const string OpenJobOpenings = "JobOpenings:Open";
    public const string PauseJobOpenings = "JobOpenings:Pause";
    public const string CloseJobOpenings = "JobOpenings:Close";
    public const string CreateJobPostings = "JobPostings:Create";
    public const string EditJobPostings = "JobPostings:Edit";
    public const string PublishJobPostings = "JobPostings:Publish";
    public const string CloseJobPostings = "JobPostings:Close";
    public const string CreateCandidates = "Candidates:Create";
    public const string EditCandidates = "Candidates:Edit";
    public const string CreateEmploymentApplications = "EmploymentApplications:Create";
    public const string MoveEmploymentApplications = "EmploymentApplications:Move";
    public const string RejectEmploymentApplications = "EmploymentApplications:Reject";
    public const string WithdrawEmploymentApplications = "EmploymentApplications:Withdraw";
    public const string HireCandidate = "EmploymentApplications:Hire";
    public const string ScheduleInterviews = "Interviews:Schedule";
    public const string CancelInterviews = "Interviews:Cancel";
    public const string CompleteInterviews = "Interviews:Complete";
    public const string EvaluateInterviews = "Interviews:Evaluate";
    public const string CreateJobOffers = "JobOffers:Create";
    public const string SubmitJobOffers = "JobOffers:Submit";
    public const string ReviewJobOffers = "JobOffers:Review";
    public const string IssueJobOffers = "JobOffers:Issue";
    public const string RespondJobOffers = "JobOffers:Respond";
    public const string EditRecruitmentSettings = "RecruitmentSettings:Edit";

    public const string ViewWorkforcePlans = "WorkforcePlans:View";
    public const string CreateWorkforcePlans = "WorkforcePlans:Create";
    public const string EditWorkforcePlans = "WorkforcePlans:Edit";
    public const string ArchiveWorkforcePlans = "WorkforcePlans:Archive";
    public const string RestoreWorkforcePlans = "WorkforcePlans:Restore";
    public const string ApproveWorkforcePlans = "WorkforcePlans:Approve";
    public const string ViewWorkforceBudgets = "WorkforceBudgets:View";
    public const string CreateWorkforceBudgets = "WorkforceBudgets:Create";
    public const string EditWorkforceBudgets = "WorkforceBudgets:Edit";
    public const string SubmitWorkforceBudgets = "WorkforceBudgets:Submit";
    public const string ReviewWorkforceBudgets = "WorkforceBudgets:Review";
    public const string ViewPositionEnvelopes = "PositionEnvelopes:View";
    public const string ViewEnvelopeAmendments = "EnvelopeAmendments:View";
    public const string CreateEnvelopeAmendments = "EnvelopeAmendments:Create";
    public const string ApproveEnvelopeAmendments = "EnvelopeAmendments:Approve";
    public const string ViewStaffingRequests = "StaffingRequests:View";
    public const string CreateStaffingRequests = "StaffingRequests:Create";
    public const string ApproveStaffingRequests = "StaffingRequests:Approve";
    public const string ViewWorkforceTrace = "WorkforcePlanning:ViewTrace";
    public const string ViewWorkforceFinancials = "WorkforcePlanning:ViewFinancials";

    public const string ViewAttendanceDevices = "AttendanceDevices:View";
    public const string CreateAttendanceDevices = "AttendanceDevices:Create";
    public const string EditAttendanceDevices = "AttendanceDevices:Edit";
    public const string SetAttendanceDeviceStatus = "AttendanceDevices:SetStatus";
    public const string EditAttendanceDeviceCredentials = "AttendanceDevices:EditCredentials";
    public const string CreateAttendanceAgents = "AttendanceAgents:Create";
    public const string DetectAttendanceDevices = "AttendanceDevices:Detect";
    public const string TestAttendanceDevices = "AttendanceDevices:Test";
    public const string PullAttendanceDeviceUsers = "AttendanceDevices:PullUsers";
    public const string PullAttendance = "AttendanceDevices:PullAttendance";
    public const string ViewRawAttendanceDevices = "AttendanceDevices:ViewRaw";

    public static IReadOnlyList<string> OrganizationalStructure { get; } =
    [
        ViewOrganizationalStructure, CreateOrganizationalStructure, EditOrganizationalStructure,
        ArchiveOrganizationalStructure, RestoreOrganizationalStructure, ApproveJobDescriptions
    ];

    public static IReadOnlyList<string> Recruitment { get; } =
    [
        ViewRecruitment,
        CreateJobRequisitions, SubmitJobRequisitions, ReviewJobRequisitions, CancelJobRequisitions,
        CreateJobOpenings, OpenJobOpenings, PauseJobOpenings, CloseJobOpenings,
        CreateJobPostings, EditJobPostings, PublishJobPostings, CloseJobPostings,
        CreateCandidates, EditCandidates,
        CreateEmploymentApplications, MoveEmploymentApplications, RejectEmploymentApplications,
        WithdrawEmploymentApplications, HireCandidate,
        ScheduleInterviews, CancelInterviews, CompleteInterviews, EvaluateInterviews,
        CreateJobOffers, SubmitJobOffers, ReviewJobOffers, IssueJobOffers, RespondJobOffers,
        EditRecruitmentSettings
    ];

    public static IReadOnlyList<string> Workforce { get; } =
    [
        ViewWorkforcePlans, CreateWorkforcePlans, EditWorkforcePlans, ArchiveWorkforcePlans,
        RestoreWorkforcePlans, ApproveWorkforcePlans,
        ViewWorkforceBudgets, CreateWorkforceBudgets, EditWorkforceBudgets,
        SubmitWorkforceBudgets, ReviewWorkforceBudgets, ViewPositionEnvelopes,
        ViewEnvelopeAmendments, CreateEnvelopeAmendments, ApproveEnvelopeAmendments,
        ViewStaffingRequests, CreateStaffingRequests, ApproveStaffingRequests,
        ViewWorkforceTrace, ViewWorkforceFinancials
    ];

    public static IReadOnlyList<string> Attendance { get; } =
    [
        ViewAttendanceDevices, CreateAttendanceDevices, EditAttendanceDevices,
        SetAttendanceDeviceStatus, EditAttendanceDeviceCredentials, CreateAttendanceAgents,
        DetectAttendanceDevices, TestAttendanceDevices, PullAttendanceDeviceUsers,
        PullAttendance, ViewRawAttendanceDevices
    ];

    public static IReadOnlyList<string> All { get; } =
        OrganizationalStructure.Concat(Recruitment).Concat(Workforce).Concat(Attendance).ToArray();
}
