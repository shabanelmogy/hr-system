using Scrutor;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.Addresses.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.AddressTypes.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.Countries.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.Countries.Persistence;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.States.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.States.Persistence;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.Districts.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.Districts.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.States.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.Security.Users.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.Appointments.Jobs;
using ErpSystem.Modules.HR.Application.Common.Realtime;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.Analytics.ReportTemplates.Persistence;
using ErpSystem.Modules.HR.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Analytics.CrystalReports.Security;
using ErpSystem.Modules.HR.Infrastructure.Features.Analytics.CrystalReports.Storage;
using ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.OrganizationalStructure.CompanyGeographicScope.Persistence;
using ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.Management.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.OrganizationalStructure.Management;
using ErpSystem.Modules.HR.Infrastructure.Features.OrganizationalStructure.Management.Jobs;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Commands;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Services;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Jobs;
using ErpSystem.Modules.HR.Application.Features.Finance.FiscalYears.Abstractions;
using ErpSystem.Modules.HR.Infrastructure.Features.Finance.FiscalYears.Jobs;
using ErpSystem.Modules.HR.Infrastructure.Features.Finance.FiscalYears.Persistence;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;
using ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class EntitiesService
{
    public static IServiceCollection AddEntitiesService(this IServiceCollection services)
    {
        services.AddScoped<IEmailSender, EmailService>();
        services.AddScoped<IRealtimeEntityPublisher, SignalRRealtimeEntityPublisher>();
        services.AddScoped<IRealtimeChangeDispatcher, HangfireRealtimeChangeDispatcher>();
        services.AddScoped<IReportTemplateStore, ReportTemplateStore>();
        services.AddScoped<ICrystalReportStore, CrystalReportStore>();
        services.AddScoped<ICrystalReportFileStorage, PrivateCrystalReportFileStorage>();
        services.AddScoped<ICrystalReportDataSource, CrystalReportDataSource>();
        services.AddScoped<ICurrentPermissionChecker, CurrentPermissionChecker>();
        services.AddScoped<ICompanyGeographicScopeStore, CompanyGeographicScopeStore>();
        services.AddScoped<IOrganizationalStructureManagement, OrganizationalStructureManagement>();
        services.AddScoped<IOrganizationalStructureChangeScheduler, OrganizationalStructureChangeScheduler>();
        services.AddScoped<OrganizationalStructureChangedJob>();
        services.AddScoped<IAttendanceCredentialProtector, AttendanceDeviceCredentialProtector>();
        services.AddScoped<IAttendanceAgentAuthenticator, AttendanceAgentAuthenticator>();
        services.AddSingleton<IAttendanceAgentInstallationSettings, AttendanceAgentInstallationSettings>();
        services.AddScoped<IAttendanceNetworkPolicy, AttendanceNetworkPolicy>();
        services.AddScoped<AttendanceDeviceEffects>();
        services.AddScoped<AttendanceDeviceStore>();
        services.AddScoped<IAttendanceDeviceReadStore>(provider => provider.GetRequiredService<AttendanceDeviceStore>());
        services.AddScoped<IAttendanceDeviceWriteStore>(provider => provider.GetRequiredService<AttendanceDeviceStore>());
        services.AddScoped<IAttendanceRawStore, AttendanceRawStore>();
        services.AddScoped<IAttendancePullScheduler, AttendancePullScheduler>();
        services.AddScoped<AttendancePullJob>();
        services.AddScoped<RealtimeEntityChangedJob>();
        services.AddScoped<CountryChangedJob>();
        services.AddScoped<ICountryReadStore, CountryReadStore>();
        services.AddScoped<ICountryWriteStore, CountryWriteStore>();
        services.AddScoped<ICountryChangeScheduler, CountryChangeScheduler>();
        services.AddScoped<ICountryAuditTrail, CountryAuditTrail>();
        services.AddScoped<StateChangedJob>();
        services.AddScoped<StateManagementChangedJob>();
        services.AddScoped<IStateReadStore, StateReadStore>();
        services.AddScoped<IStateWriteStore, StateWriteStore>();
        services.AddScoped<IStateChangeScheduler, StateChangeScheduler>();
        services.AddScoped<IStateAuditTrail, StateAuditTrail>();
        services.AddScoped<DistrictChangedJob>();
        services.AddScoped<DistrictManagementChangedJob>();
        services.AddScoped<IDistrictReadStore, DistrictReadStore>();
        services.AddScoped<IDistrictWriteStore, DistrictWriteStore>();
        services.AddScoped<IDistrictChangeScheduler, DistrictChangeScheduler>();
        services.AddScoped<IDistrictAuditTrail, DistrictAuditTrail>();
        services.AddScoped<AddressTypeChangedJob>();
        services.AddScoped<AddressTypeManagementChangedJob>();
        services.AddScoped<IAddressTypeReadStore, AddressTypeReadStore>();
        services.AddScoped<IAddressTypeWriteStore, AddressTypeWriteStore>();
        services.AddScoped<IAddressTypeChangeScheduler, AddressTypeChangeScheduler>();
        services.AddScoped<IAddressTypeAuditTrail, AddressTypeAuditTrail>();
        services.AddScoped<AddressChangedJob>();
        services.AddScoped<UserChangedJob>();
        services.AddScoped<AppointmentChangedJob>();
        services.AddScoped<SessionRevokedJob>();
        services.AddScoped<FiscalYearChangedJob>();
        services.AddScoped<IFiscalYearReadStore, FiscalYearReadStore>();
        services.AddScoped<IFiscalYearWriteStore, FiscalYearWriteStore>();
        services.AddScoped<IFiscalYearAuditTrail, FiscalYearAuditTrail>();
        services.AddScoped<IFiscalYearChangeScheduler, FiscalYearChangeScheduler>();
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

        services.Scan(scan => scan
            .FromAssemblies(ErpSystem.Modules.HR.Infrastructure.AssemblyReference.Assembly)
            .AddClasses(classes => classes.Where(type =>
                type is { IsAbstract: false, IsGenericTypeDefinition: false } &&
                type.Name.EndsWith("Service", StringComparison.Ordinal) &&
                type.GetInterfaces().Any(@interface =>
                    @interface.Name.EndsWith("Service", StringComparison.Ordinal))))
            .UsingRegistrationStrategy(RegistrationStrategy.Skip)
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
