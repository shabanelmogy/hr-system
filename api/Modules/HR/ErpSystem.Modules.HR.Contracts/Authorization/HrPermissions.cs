namespace ErpSystem.Modules.HR.Contracts.Authorization;

public static class HrPermissions
{
    public const string ViewOrganizationalStructure = "OrganizationalStructure:View";
    public const string CreateOrganizationalStructure = "OrganizationalStructure:Create";
    public const string EditOrganizationalStructure = "OrganizationalStructure:Edit";
    public const string DeleteOrganizationalStructure = "OrganizationalStructure:Delete";
    public const string ApproveJobDescriptions = "OrganizationalStructure:ApproveJobDescriptions";

    public const string ViewRecruitment = "Recruitment:View";
    public const string ManageJobRequisitions = "Recruitment:ManageJobRequisitions";
    public const string ApproveJobRequisitions = "Recruitment:ApproveJobRequisitions";
    public const string ManageJobOpenings = "Recruitment:ManageJobOpenings";
    public const string ManageJobPostings = "Recruitment:ManageJobPostings";
    public const string ManageCandidates = "Recruitment:ManageCandidates";
    public const string ManageApplications = "Recruitment:ManageApplications";
    public const string EvaluateInterviews = "Recruitment:EvaluateInterviews";
    public const string ManageJobOffers = "Recruitment:ManageJobOffers";
    public const string ApproveJobOffers = "Recruitment:ApproveJobOffers";
    public const string HireCandidate = "Recruitment:HireCandidate";

    public const string ViewWorkforcePlans = "WorkforcePlans:View";
    public const string CreateWorkforcePlans = "WorkforcePlans:Create";
    public const string EditWorkforcePlans = "WorkforcePlans:Edit";
    public const string DeleteWorkforcePlans = "WorkforcePlans:Delete";
    public const string ApproveWorkforcePlans = "WorkforcePlans:Approve";
    public const string ViewWorkforceBudgets = "WorkforceBudgets:View";
    public const string ManageWorkforceBudgets = "WorkforceBudgets:Manage";
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
    public const string ManageAttendanceDevices = "AttendanceDevices:Manage";
    public const string ManageAttendanceDeviceCredentials = "AttendanceDevices:Credentials";
    public const string PullAttendanceDevices = "AttendanceDevices:Pull";
    public const string ViewRawAttendanceDevices = "AttendanceDevices:ViewRaw";

    public static IReadOnlyList<string> OrganizationalStructure { get; } =
    [
        ViewOrganizationalStructure, CreateOrganizationalStructure,
        EditOrganizationalStructure, DeleteOrganizationalStructure, ApproveJobDescriptions
    ];

    public static IReadOnlyList<string> Recruitment { get; } =
    [
        ViewRecruitment, ManageJobRequisitions, ApproveJobRequisitions,
        ManageJobOpenings, ManageJobPostings, ManageCandidates, ManageApplications,
        EvaluateInterviews, ManageJobOffers, ApproveJobOffers, HireCandidate
    ];

    public static IReadOnlyList<string> Workforce { get; } =
    [
        ViewWorkforcePlans, CreateWorkforcePlans, EditWorkforcePlans, DeleteWorkforcePlans,
        ApproveWorkforcePlans, ViewWorkforceBudgets, ManageWorkforceBudgets, ViewPositionEnvelopes,
        ViewEnvelopeAmendments, CreateEnvelopeAmendments, ApproveEnvelopeAmendments,
        ViewStaffingRequests, CreateStaffingRequests, ApproveStaffingRequests,
        ViewWorkforceTrace, ViewWorkforceFinancials
    ];

    public static IReadOnlyList<string> Attendance { get; } =
    [
        ViewAttendanceDevices, ManageAttendanceDevices, ManageAttendanceDeviceCredentials,
        PullAttendanceDevices, ViewRawAttendanceDevices
    ];

    public static IReadOnlyList<string> All { get; } =
        OrganizationalStructure.Concat(Recruitment).Concat(Workforce).Concat(Attendance).ToArray();
}