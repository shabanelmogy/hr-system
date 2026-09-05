using Scrutor;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Jobs;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.AddressTypes.Persistence;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Jobs;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Persistence;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Persistence;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Districts.Jobs;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.States.Jobs;
using HrManagementSystem.Application.Features.Platform.Notifications.Services;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Jobs;
using HrManagementSystem.Infrastructure.Features.Security.Users.Jobs;
using HrManagementSystem.Infrastructure.Features.Appointments.Jobs;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Abstractions;
using HrManagementSystem.Infrastructure.Features.Analytics.ReportTemplates.Persistence;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Security;
using HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Abstractions;
using HrManagementSystem.Infrastructure.Features.OrganizationalStructure.CompanyGeographicScope.Persistence;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Abstractions;
using HrManagementSystem.Infrastructure.Features.OrganizationalStructure.Management;
using HrManagementSystem.Infrastructure.Features.OrganizationalStructure.Management.Jobs;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Application.Features.Attendance.Devices.Commands;
using HrManagementSystem.Infrastructure.Features.Attendance.Devices.Services;
using HrManagementSystem.Infrastructure.Features.Attendance.Devices.Persistence;
using HrManagementSystem.Infrastructure.Features.Attendance.Devices.Jobs;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Abstractions;
using HrManagementSystem.Infrastructure.Features.Finance.FiscalYears.Jobs;
using HrManagementSystem.Infrastructure.Features.Finance.FiscalYears.Persistence;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class EntitiesService
{
    public static IServiceCollection AddEntitiesService(this IServiceCollection services)
    {
        services.AddScoped<IEmailSender, EmailService>();
        services.AddScoped<INotificationPublisher, NotificationPublisher>();
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

        services.Scan(scan => scan
            .FromAssemblies(HrManagementSystem.Infrastructure.AssemblyReference.Assembly)
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
