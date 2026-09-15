using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Commands;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;
using ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.Management.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Dashboard;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.OrganizationalStructure.Management;
using ErpSystem.Modules.HR.Infrastructure.Features.OrganizationalStructure.Management.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Candidates.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Dashboard;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.EmploymentApplications.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobPostings.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobOpenings.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobOffers.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.JobRequisitions.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Interviews.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Shared;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Settings.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class EntitiesService
{
    public static IServiceCollection AddEntitiesService(this IServiceCollection services)
    {
        services.AddScoped<IOrganizationalStructureManagement, OrganizationalStructureManagement>();
        services.AddScoped<IOrganizationalStructureChangeScheduler, OrganizationalStructureChangeScheduler>();
        services.AddScoped<OrganizationalStructureChangedJob>();

        services.AddScoped<IAttendanceCredentialProtector, AttendanceDeviceCredentialProtector>();
        services.AddScoped<IAttendanceAgentAuthenticator, AttendanceAgentAuthenticator>();
        services.AddSingleton<IAttendanceAgentCredentialGenerator, AttendanceAgentCredentialGenerator>();
        services.AddSingleton<IAttendanceEventKeyGenerator, AttendanceEventKeyGenerator>();
        services.AddSingleton<IAttendanceAgentInstallationSettings, AttendanceAgentInstallationSettings>();
        services.AddScoped<IAttendanceNetworkPolicy, AttendanceNetworkPolicy>();
        services.AddScoped<AttendanceDeviceEffects>();
        services.AddScoped<AttendanceDeviceStore>();
        services.AddScoped<IAttendanceDeviceReadStore>(provider => provider.GetRequiredService<AttendanceDeviceStore>());
        services.AddScoped<IAttendanceDeviceWriteStore>(provider => provider.GetRequiredService<AttendanceDeviceStore>());
        services.AddScoped<IAttendanceRawStore, AttendanceRawStore>();
        services.AddScoped<IAttendancePullScheduler, AttendancePullScheduler>();
        services.AddScoped<AttendancePullJob>();

        services.AddScoped<ICandidateReadStore, CandidateReadStore>();
        services.AddScoped<ICandidateRepository, CandidateRepository>();
        services.AddScoped<IRecruitmentDashboardReadStore, RecruitmentDashboardReadStore>();
        services.AddScoped<IEmploymentApplicationReadStore, EmploymentApplicationReadStore>();
        services.AddScoped<IEmploymentApplicationRepository, EmploymentApplicationRepository>();
        services.AddScoped<IRecruitmentHireRepository, RecruitmentHireRepository>();
        services.AddScoped<IJobPostingReadStore, JobPostingReadStore>();
        services.AddScoped<IJobPostingRepository, JobPostingRepository>();
        services.AddScoped<IJobOpeningReadStore, JobOpeningReadStore>();
        services.AddScoped<IJobOpeningRepository, JobOpeningRepository>();
        services.AddScoped<IJobOfferReadStore, JobOfferReadStore>();
        services.AddScoped<IJobOfferRepository, JobOfferRepository>();
        services.AddScoped<IJobRequisitionReadStore, JobRequisitionReadStore>();
        services.AddScoped<IJobRequisitionRepository, JobRequisitionRepository>();
        services.AddScoped<IRecruitmentRequisitionPolicy, RecruitmentRequisitionPolicy>();
        services.AddScoped<IRecruitmentActorEmployeeSource, RecruitmentActorEmployeeSource>();
        services.AddScoped<IInterviewReadStore, InterviewReadStore>();
        services.AddScoped<IInterviewRepository, InterviewRepository>();
        services.AddScoped<IRecruitmentSettingsReadStore, RecruitmentSettingsReadStore>();
        services.AddScoped<IRecruitmentSettingsRepository, RecruitmentSettingsRepository>();
        services.AddScoped<IWorkforcePlanReadStore, WorkforcePlanReadStore>();
        services.AddScoped<IWorkforcePlanWriteStore, WorkforcePlanWriteStore>();
        services.AddScoped<WorkforcePlanEffects>();
        services.AddScoped<IWorkforceBudgetReadStore, WorkforceBudgetReadStore>();
        services.AddScoped<IWorkforceBudgetWriteStore, WorkforceBudgetWriteStore>();
        services.AddScoped<WorkforceBudgetEffects>();
        services.AddScoped<IStaffingReadStore, StaffingReadStore>();
        services.AddScoped<IStaffingWriteStore, StaffingWriteStore>();
        services.AddScoped<StaffingEffects>();
        services.AddScoped<IWorkforceTraceReadStore, WorkforceTraceReadStore>();

        return services;
    }
}
