using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Errors;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;

namespace ErpSystem.Modules.HR.Infrastructure.Dependencies;

public static class ErrorsService
{
    public static IServiceCollection AddErrorsService(this IServiceCollection services)
    {
        services.AddScoped<AttendanceDeviceErrors>();
        services.AddScoped<WorkforcePlanErrors>();
        services.AddScoped<WorkforceBudgetErrors>();
        services.AddScoped<StaffingErrors>();
        return services;
    }
}
