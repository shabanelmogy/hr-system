using HrManagementSystem.Application.Features.Appointments.Errors;
using HrManagementSystem.Application.Features.Platform.Notifications.Errors;
using HrManagementSystem.Application.Features.Analytics.Reports.Errors;
using HrManagementSystem.Application.Features.Catalog.Categories.Errors;
using HrManagementSystem.Application.Features.Catalog.SubCategories.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Errors;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Errors;
using HrManagementSystem.Application.Features.Platform.Localization.Errors;
using HrManagementSystem.Application.Features.Security.ApiKeys.Errors;
using HrManagementSystem.Application.Features.Security.Authorization.Errors;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Errors;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Errors;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Errors;
using HrManagementSystem.Application.Features.Attendance.Devices.Errors;

namespace HrManagementSystem.Infrastructure.Dependencies;

public static class ErrorsService
{
    public static IServiceCollection AddErrorsService(this IServiceCollection service)
    {
        service.AddScoped<RoleErrors>();
        service.AddScoped<UserErrors>();
        service.AddScoped<LocalizationError>();
        service.AddScoped<CategoryErrors>();
        service.AddScoped<SubCategoryErrors>();
        service.AddScoped<ReportCategoryErrors>();
        service.AddScoped<ReportTemplateErrors>();
        service.AddScoped<CrystalReportErrors>();
        service.AddScoped<ApiKeyErrors>();
        service.AddScoped<CountryErrors>();
        service.AddScoped<StateErrors>();
        service.AddScoped<DistrictErrors>();
        service.AddScoped<AddressErrors>();
        service.AddScoped<AddressTypeErrors>();
        service.AddScoped<CompanyGeographicScopeErrors>();
        service.AddScoped<AppointmentErrors>();
        service.AddScoped<NotificationErrors>();
        service.AddScoped<AttendanceDeviceErrors>();

        return service;
    }
}
