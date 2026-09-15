using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Errors;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.Reporting.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddReportingApplication(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();
        services.AddScoped<ReportCategoryErrors>();
        services.AddScoped<ReportTemplateErrors>();
        services.AddScoped<CrystalReportErrors>();

        return services;
    }
}
