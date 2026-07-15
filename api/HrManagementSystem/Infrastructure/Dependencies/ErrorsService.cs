using HrManagementSystem.Features.Appointments.Errors;
using HrManagementSystem.Features.Platform.Notifications.Errors;
using HrManagementSystem.Features.Analytics.Reports.Errors;
using HrManagementSystem.Features.Catalog.Categories.Errors;
using HrManagementSystem.Features.Catalog.SubCategories.Errors;
using HrManagementSystem.Features.GeographicalInformation.Addresses.Errors;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Errors;
using HrManagementSystem.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Features.GeographicalInformation.Districts.Errors;
using HrManagementSystem.Features.GeographicalInformation.States.Errors;
using HrManagementSystem.Features.Platform.Localization.Errors;
using HrManagementSystem.Features.Security.ApiKeys.Errors;
using HrManagementSystem.Features.Security.Authorization.Errors;
using HrManagementSystem.Features.Security.Users.Errors;

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
        service.AddScoped<ApiKeyErrors>();
        service.AddScoped<CountryErrors>();
        service.AddScoped<StateErrors>();
        service.AddScoped<DistrictErrors>();
        service.AddScoped<AddressErrors>();
        service.AddScoped<AddressTypeErrors>();
        service.AddScoped<AppointmentErrors>();
        service.AddScoped<NotificationErrors>();

        return service;
    }
}
