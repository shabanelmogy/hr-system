using HrManagementSystem.Features.Appointments.Errors;
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

        return service;
    }
}
