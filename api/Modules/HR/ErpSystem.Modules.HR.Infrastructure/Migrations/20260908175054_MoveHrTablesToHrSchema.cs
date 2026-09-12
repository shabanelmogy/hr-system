using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.HR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MoveHrTablesToHrSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "hr");

            migrationBuilder.RenameTable(
                name: "WorkforcePlans",
                newName: "WorkforcePlans",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "WorkforcePlanLines",
                newName: "WorkforcePlanLines",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "WorkforcePlanLinePeriodTargets",
                newName: "WorkforcePlanLinePeriodTargets",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "WorkforceBudgets",
                newName: "WorkforceBudgets",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "WorkforceBudgetPeriodAllocations",
                newName: "WorkforceBudgetPeriodAllocations",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "WorkforceBudgetLines",
                newName: "WorkforceBudgetLines",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "UserTenantAccesses",
                newName: "UserTenantAccesses",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "UserInvitations",
                newName: "UserInvitations",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "UserCompanyAccesses",
                newName: "UserCompanyAccesses",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Tenants",
                newName: "Tenants",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "SubCategories",
                newName: "SubCategories",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "States",
                newName: "States",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "StaffingRequests",
                newName: "StaffingRequests",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "SecurityAuditEvents",
                newName: "SecurityAuditEvents",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "ReportTemplates",
                newName: "ReportTemplates",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "ReportTemplateRevisions",
                newName: "ReportTemplateRevisions",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "ReportsMasters",
                newName: "ReportsMasters",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "ReportsDetails",
                newName: "ReportsDetails",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "ReportsCategories",
                newName: "ReportsCategories",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RefreshToken",
                newName: "RefreshToken",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RecruitmentStages",
                newName: "RecruitmentStages",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RecruitmentSources",
                newName: "RecruitmentSources",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RecruitmentRejectionReasons",
                newName: "RecruitmentRejectionReasons",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RecruitmentPolicies",
                newName: "RecruitmentPolicies",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RecruitmentEvaluationCriteria",
                newName: "RecruitmentEvaluationCriteria",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RawDeviceUsers",
                newName: "RawDeviceUsers",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "RawAttendancePunches",
                newName: "RawAttendancePunches",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Positions",
                newName: "Positions",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "PositionEnvelopes",
                newName: "PositionEnvelopes",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notifications",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "LoginAudits",
                newName: "LoginAudits",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobTitles",
                newName: "JobTitles",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobRequisitions",
                newName: "JobRequisitions",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobPostings",
                newName: "JobPostings",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobOpenings",
                newName: "JobOpenings",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobOffers",
                newName: "JobOffers",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobOfferApprovalHistory",
                newName: "JobOfferApprovalHistory",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobLevels",
                newName: "JobLevels",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "JobDescriptions",
                newName: "JobDescriptions",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Interviews",
                newName: "Interviews",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "InterviewParticipants",
                newName: "InterviewParticipants",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "InterviewEvaluations",
                newName: "InterviewEvaluations",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "FiscalYears",
                newName: "FiscalYears",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "FiscalPeriods",
                newName: "FiscalPeriods",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Files",
                newName: "Files",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "EnvelopeAmendments",
                newName: "EnvelopeAmendments",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "EntityChangeLogs",
                newName: "EntityChangeLogs",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "EmploymentApplications",
                newName: "EmploymentApplications",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Employees",
                newName: "Employees",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "EmployeeContracts",
                newName: "EmployeeContracts",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "EmployeeAssignments",
                newName: "EmployeeAssignments",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Divisions",
                newName: "Divisions",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Districts",
                newName: "Districts",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "DevicePullRuns",
                newName: "DevicePullRuns",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Departments",
                newName: "Departments",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Currencies",
                newName: "Currencies",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "CrystalReportVersions",
                newName: "CrystalReportVersions",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "CrystalReports",
                newName: "CrystalReports",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "CrystalReportRoleGrants",
                newName: "CrystalReportRoleGrants",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Countries",
                newName: "Countries",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "CostCenters",
                newName: "CostCenters",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "CompanyCountries",
                newName: "CompanyCountries",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "CompanyAddresses",
                newName: "CompanyAddresses",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Companies",
                newName: "Companies",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "CategorySubcategories",
                newName: "CategorySubcategories",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Categories",
                newName: "Categories",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Candidates",
                newName: "Candidates",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Branches",
                newName: "Branches",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "BranchAddresses",
                newName: "BranchAddresses",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AuthenticationSelectionChallenges",
                newName: "AuthenticationSelectionChallenges",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AttendanceDevices",
                newName: "AttendanceDevices",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AttendanceDeviceCredentials",
                newName: "AttendanceDeviceCredentials",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AttendanceAgents",
                newName: "AttendanceAgents",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AspNetUserTokens",
                newName: "AspNetUserTokens",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AspNetUsers",
                newName: "AspNetUsers",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AspNetUserRoles",
                newName: "AspNetUserRoles",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AspNetUserLogins",
                newName: "AspNetUserLogins",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AspNetUserClaims",
                newName: "AspNetUserClaims",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AspNetRoles",
                newName: "AspNetRoles",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AspNetRoleClaims",
                newName: "AspNetRoleClaims",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Appointments",
                newName: "Appointments",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "ApplicationStatusHistories",
                newName: "ApplicationStatusHistories",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "ApiKeys",
                newName: "ApiKeys",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "AddressTypes",
                newName: "AddressTypes",
                newSchema: "hr");

            migrationBuilder.RenameTable(
                name: "Addresses",
                newName: "Addresses",
                newSchema: "hr");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "WorkforcePlans",
                schema: "hr",
                newName: "WorkforcePlans");

            migrationBuilder.RenameTable(
                name: "WorkforcePlanLines",
                schema: "hr",
                newName: "WorkforcePlanLines");

            migrationBuilder.RenameTable(
                name: "WorkforcePlanLinePeriodTargets",
                schema: "hr",
                newName: "WorkforcePlanLinePeriodTargets");

            migrationBuilder.RenameTable(
                name: "WorkforceBudgets",
                schema: "hr",
                newName: "WorkforceBudgets");

            migrationBuilder.RenameTable(
                name: "WorkforceBudgetPeriodAllocations",
                schema: "hr",
                newName: "WorkforceBudgetPeriodAllocations");

            migrationBuilder.RenameTable(
                name: "WorkforceBudgetLines",
                schema: "hr",
                newName: "WorkforceBudgetLines");

            migrationBuilder.RenameTable(
                name: "UserTenantAccesses",
                schema: "hr",
                newName: "UserTenantAccesses");

            migrationBuilder.RenameTable(
                name: "UserInvitations",
                schema: "hr",
                newName: "UserInvitations");

            migrationBuilder.RenameTable(
                name: "UserCompanyAccesses",
                schema: "hr",
                newName: "UserCompanyAccesses");

            migrationBuilder.RenameTable(
                name: "Tenants",
                schema: "hr",
                newName: "Tenants");

            migrationBuilder.RenameTable(
                name: "SubCategories",
                schema: "hr",
                newName: "SubCategories");

            migrationBuilder.RenameTable(
                name: "States",
                schema: "hr",
                newName: "States");

            migrationBuilder.RenameTable(
                name: "StaffingRequests",
                schema: "hr",
                newName: "StaffingRequests");

            migrationBuilder.RenameTable(
                name: "SecurityAuditEvents",
                schema: "hr",
                newName: "SecurityAuditEvents");

            migrationBuilder.RenameTable(
                name: "ReportTemplates",
                schema: "hr",
                newName: "ReportTemplates");

            migrationBuilder.RenameTable(
                name: "ReportTemplateRevisions",
                schema: "hr",
                newName: "ReportTemplateRevisions");

            migrationBuilder.RenameTable(
                name: "ReportsMasters",
                schema: "hr",
                newName: "ReportsMasters");

            migrationBuilder.RenameTable(
                name: "ReportsDetails",
                schema: "hr",
                newName: "ReportsDetails");

            migrationBuilder.RenameTable(
                name: "ReportsCategories",
                schema: "hr",
                newName: "ReportsCategories");

            migrationBuilder.RenameTable(
                name: "RefreshToken",
                schema: "hr",
                newName: "RefreshToken");

            migrationBuilder.RenameTable(
                name: "RecruitmentStages",
                schema: "hr",
                newName: "RecruitmentStages");

            migrationBuilder.RenameTable(
                name: "RecruitmentSources",
                schema: "hr",
                newName: "RecruitmentSources");

            migrationBuilder.RenameTable(
                name: "RecruitmentRejectionReasons",
                schema: "hr",
                newName: "RecruitmentRejectionReasons");

            migrationBuilder.RenameTable(
                name: "RecruitmentPolicies",
                schema: "hr",
                newName: "RecruitmentPolicies");

            migrationBuilder.RenameTable(
                name: "RecruitmentEvaluationCriteria",
                schema: "hr",
                newName: "RecruitmentEvaluationCriteria");

            migrationBuilder.RenameTable(
                name: "RawDeviceUsers",
                schema: "hr",
                newName: "RawDeviceUsers");

            migrationBuilder.RenameTable(
                name: "RawAttendancePunches",
                schema: "hr",
                newName: "RawAttendancePunches");

            migrationBuilder.RenameTable(
                name: "Positions",
                schema: "hr",
                newName: "Positions");

            migrationBuilder.RenameTable(
                name: "PositionEnvelopes",
                schema: "hr",
                newName: "PositionEnvelopes");

            migrationBuilder.RenameTable(
                name: "Notifications",
                schema: "hr",
                newName: "Notifications");

            migrationBuilder.RenameTable(
                name: "LoginAudits",
                schema: "hr",
                newName: "LoginAudits");

            migrationBuilder.RenameTable(
                name: "JobTitles",
                schema: "hr",
                newName: "JobTitles");

            migrationBuilder.RenameTable(
                name: "JobRequisitions",
                schema: "hr",
                newName: "JobRequisitions");

            migrationBuilder.RenameTable(
                name: "JobPostings",
                schema: "hr",
                newName: "JobPostings");

            migrationBuilder.RenameTable(
                name: "JobOpenings",
                schema: "hr",
                newName: "JobOpenings");

            migrationBuilder.RenameTable(
                name: "JobOffers",
                schema: "hr",
                newName: "JobOffers");

            migrationBuilder.RenameTable(
                name: "JobOfferApprovalHistory",
                schema: "hr",
                newName: "JobOfferApprovalHistory");

            migrationBuilder.RenameTable(
                name: "JobLevels",
                schema: "hr",
                newName: "JobLevels");

            migrationBuilder.RenameTable(
                name: "JobDescriptions",
                schema: "hr",
                newName: "JobDescriptions");

            migrationBuilder.RenameTable(
                name: "Interviews",
                schema: "hr",
                newName: "Interviews");

            migrationBuilder.RenameTable(
                name: "InterviewParticipants",
                schema: "hr",
                newName: "InterviewParticipants");

            migrationBuilder.RenameTable(
                name: "InterviewEvaluations",
                schema: "hr",
                newName: "InterviewEvaluations");

            migrationBuilder.RenameTable(
                name: "FiscalYears",
                schema: "hr",
                newName: "FiscalYears");

            migrationBuilder.RenameTable(
                name: "FiscalPeriods",
                schema: "hr",
                newName: "FiscalPeriods");

            migrationBuilder.RenameTable(
                name: "Files",
                schema: "hr",
                newName: "Files");

            migrationBuilder.RenameTable(
                name: "EnvelopeAmendments",
                schema: "hr",
                newName: "EnvelopeAmendments");

            migrationBuilder.RenameTable(
                name: "EntityChangeLogs",
                schema: "hr",
                newName: "EntityChangeLogs");

            migrationBuilder.RenameTable(
                name: "EmploymentApplications",
                schema: "hr",
                newName: "EmploymentApplications");

            migrationBuilder.RenameTable(
                name: "Employees",
                schema: "hr",
                newName: "Employees");

            migrationBuilder.RenameTable(
                name: "EmployeeContracts",
                schema: "hr",
                newName: "EmployeeContracts");

            migrationBuilder.RenameTable(
                name: "EmployeeAssignments",
                schema: "hr",
                newName: "EmployeeAssignments");

            migrationBuilder.RenameTable(
                name: "Divisions",
                schema: "hr",
                newName: "Divisions");

            migrationBuilder.RenameTable(
                name: "Districts",
                schema: "hr",
                newName: "Districts");

            migrationBuilder.RenameTable(
                name: "DevicePullRuns",
                schema: "hr",
                newName: "DevicePullRuns");

            migrationBuilder.RenameTable(
                name: "Departments",
                schema: "hr",
                newName: "Departments");

            migrationBuilder.RenameTable(
                name: "Currencies",
                schema: "hr",
                newName: "Currencies");

            migrationBuilder.RenameTable(
                name: "CrystalReportVersions",
                schema: "hr",
                newName: "CrystalReportVersions");

            migrationBuilder.RenameTable(
                name: "CrystalReports",
                schema: "hr",
                newName: "CrystalReports");

            migrationBuilder.RenameTable(
                name: "CrystalReportRoleGrants",
                schema: "hr",
                newName: "CrystalReportRoleGrants");

            migrationBuilder.RenameTable(
                name: "Countries",
                schema: "hr",
                newName: "Countries");

            migrationBuilder.RenameTable(
                name: "CostCenters",
                schema: "hr",
                newName: "CostCenters");

            migrationBuilder.RenameTable(
                name: "CompanyCountries",
                schema: "hr",
                newName: "CompanyCountries");

            migrationBuilder.RenameTable(
                name: "CompanyAddresses",
                schema: "hr",
                newName: "CompanyAddresses");

            migrationBuilder.RenameTable(
                name: "Companies",
                schema: "hr",
                newName: "Companies");

            migrationBuilder.RenameTable(
                name: "CategorySubcategories",
                schema: "hr",
                newName: "CategorySubcategories");

            migrationBuilder.RenameTable(
                name: "Categories",
                schema: "hr",
                newName: "Categories");

            migrationBuilder.RenameTable(
                name: "Candidates",
                schema: "hr",
                newName: "Candidates");

            migrationBuilder.RenameTable(
                name: "Branches",
                schema: "hr",
                newName: "Branches");

            migrationBuilder.RenameTable(
                name: "BranchAddresses",
                schema: "hr",
                newName: "BranchAddresses");

            migrationBuilder.RenameTable(
                name: "AuthenticationSelectionChallenges",
                schema: "hr",
                newName: "AuthenticationSelectionChallenges");

            migrationBuilder.RenameTable(
                name: "AttendanceDevices",
                schema: "hr",
                newName: "AttendanceDevices");

            migrationBuilder.RenameTable(
                name: "AttendanceDeviceCredentials",
                schema: "hr",
                newName: "AttendanceDeviceCredentials");

            migrationBuilder.RenameTable(
                name: "AttendanceAgents",
                schema: "hr",
                newName: "AttendanceAgents");

            migrationBuilder.RenameTable(
                name: "AspNetUserTokens",
                schema: "hr",
                newName: "AspNetUserTokens");

            migrationBuilder.RenameTable(
                name: "AspNetUsers",
                schema: "hr",
                newName: "AspNetUsers");

            migrationBuilder.RenameTable(
                name: "AspNetUserRoles",
                schema: "hr",
                newName: "AspNetUserRoles");

            migrationBuilder.RenameTable(
                name: "AspNetUserLogins",
                schema: "hr",
                newName: "AspNetUserLogins");

            migrationBuilder.RenameTable(
                name: "AspNetUserClaims",
                schema: "hr",
                newName: "AspNetUserClaims");

            migrationBuilder.RenameTable(
                name: "AspNetRoles",
                schema: "hr",
                newName: "AspNetRoles");

            migrationBuilder.RenameTable(
                name: "AspNetRoleClaims",
                schema: "hr",
                newName: "AspNetRoleClaims");

            migrationBuilder.RenameTable(
                name: "Appointments",
                schema: "hr",
                newName: "Appointments");

            migrationBuilder.RenameTable(
                name: "ApplicationStatusHistories",
                schema: "hr",
                newName: "ApplicationStatusHistories");

            migrationBuilder.RenameTable(
                name: "ApiKeys",
                schema: "hr",
                newName: "ApiKeys");

            migrationBuilder.RenameTable(
                name: "AddressTypes",
                schema: "hr",
                newName: "AddressTypes");

            migrationBuilder.RenameTable(
                name: "Addresses",
                schema: "hr",
                newName: "Addresses");
        }
    }
}
