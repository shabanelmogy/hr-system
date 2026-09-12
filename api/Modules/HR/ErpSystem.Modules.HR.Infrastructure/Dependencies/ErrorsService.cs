using ErpSystem.Modules.HR.Application.Features.Appointments.Errors;
using ErpSystem.Modules.HR.Application.Features.Platform.Notifications.Errors;
using ErpSystem.Modules.HR.Application.Features.Analytics.Reports.Errors;
using ErpSystem.Modules.HR.Application.Features.Catalog.Categories.Errors;
using ErpSystem.Modules.HR.Application.Features.Catalog.SubCategories.Errors;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Addresses.Errors;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.AddressTypes.Errors;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Errors;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Errors;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.States.Errors;
using ErpSystem.Modules.HR.Application.Features.Platform.Localization.Errors;
using ErpSystem.Modules.HR.Application.Features.Security.ApiKeys.Errors;
using ErpSystem.Modules.HR.Application.Features.Security.Authorization.Errors;
using ErpSystem.Modules.HR.Application.Features.Security.Users.Errors;
using ErpSystem.Modules.HR.Application.Features.Analytics.ReportTemplates.Errors;
using ErpSystem.Modules.HR.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.HR.Application.Features.OrganizationalStructure.CompanyGeographicScope.Errors;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Errors;
using ErpSystem.Modules.HR.Application.Features.Finance.FiscalYears.Errors;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

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
        service.AddScoped<FiscalYearErrors>();
        service.AddScoped<WorkforcePlanErrors>();
        service.AddScoped<WorkforceBudgetErrors>();
        service.AddScoped<StaffingErrors>();

        return service;
    }
}
