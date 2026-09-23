using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting.Services;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.ReportTemplates.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Views;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Security;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Exporting.Services;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Reports.Persistence;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.ReportTemplates.Persistence;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Views.Services;

namespace ErpSystem.Modules.Reporting.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddReportingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Reporting")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'Reporting' or 'DefaultConnection' not found.");

        services.AddDbContext<ReportingDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ReportingDbContext.Schema)));
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ReportingDbContext>());

        services.AddScoped<ICrystalReportStore, CrystalReportStore>();
        services.AddScoped<ICrystalReportDataProvider, CountriesCrystalReportDataProvider>();
        services.AddScoped<ICrystalReportDataProvider, StatesCrystalReportDataProvider>();
        services.AddScoped<ICrystalReportDataProvider, DistrictsCrystalReportDataProvider>();
        services.AddScoped<ICrystalReportDataProvider, AddressTypesCrystalReportDataProvider>();
        services.AddScoped<ICrystalReportDataProvider, FiscalYearsCrystalReportDataProvider>();
        services.AddScoped<ICrystalReportDataSource, CrystalReportDataSource>();
        services.AddScoped<ICrystalReportFileStorage, PrivateCrystalReportFileStorage>();
        services.AddScoped<ICurrentPermissionChecker, CurrentPermissionChecker>();
        services.AddScoped<IExportExcelService, ExportExcelService>();
        services.AddScoped<IExportPdfFileService, ExportPdfFileService>();
        services.AddScoped<IReportCategoryReadStore, ReportCategoryReadStore>();
        services.AddScoped<IReportCategoryRepository, ReportCategoryRepository>();
        services.AddScoped<IReportCategoryEffects, ReportCategoryEffects>();
        services.AddScoped<IReportValidationQueries, ReportValidationQueries>();
        services.AddScoped<IReportTemplateStore, ReportTemplateStore>();
        services.AddSingleton<IReportTemplateContentHashProvider, ReportTemplateContentHashProvider>();
        services.AddScoped<IViewStore, ViewStore>();
        services.AddScoped<IViewEffects, ViewEffects>();
        services.AddOptions<CrystalReportStorageOptions>()
            .Bind(configuration.GetSection(CrystalReportStorageOptions.SectionName))
            .Validate(
                options => options.MaxFileSizeBytes > 0 &&
                           options.MaxFileSizeBytes <= 10L * 1024L * 1024L &&
                           options.MaxRenderedFileSizeBytes > 0 &&
                           options.MaxRenderedFileSizeBytes <= 100L * 1024L * 1024L &&
                           options.MaxRuntimeDataSizeBytes > 0 &&
                           options.MaxRuntimeDataSizeBytes <= 10L * 1024L * 1024L &&
                           options.MaxInspectionResponseSizeBytes > 0 &&
                           options.MaxInspectionResponseSizeBytes <= 1024L * 1024L &&
                           options.MaxCatalogResponseSizeBytes > 0 &&
                           options.MaxCatalogResponseSizeBytes <= 10L * 1024L * 1024L &&
                           options.MaxDeploymentCandidates is > 0 and <= 10_000,
                "CrystalReports size and response limits must be positive and bounded.")
            .Validate(
                options => !options.RuntimeEnabled || IsValidRuntimeBaseUrl(options.RuntimeBaseUrl),
                "CrystalReports:RuntimeBaseUrl must be a non-empty absolute HTTP or HTTPS URL without user information when RuntimeEnabled is true.")
            .Validate(
                options => !options.RuntimeEnabled || HasRuntimeApiKey(options),
                "CrystalReports:RuntimeApiKey or CRYSTAL_REPORT_INTERNAL_API_KEY is required when RuntimeEnabled is true.")
            .ValidateOnStart();
        services.AddHttpClient<ICrystalReportInspector, CrystalReportInspectorClient>((provider, client) =>
        {
            ConfigureCrystalRuntimeClient(provider, client, TimeSpan.FromSeconds(30));
        });
        services.AddHttpClient<ICrystalReportDeploymentSource, CrystalReportDeploymentSourceClient>((provider, client) =>
        {
            ConfigureCrystalRuntimeClient(provider, client, TimeSpan.FromSeconds(30));
        });
        services.AddHttpClient<ICrystalReportRenderer, CrystalReportRendererClient>((provider, client) =>
        {
            ConfigureCrystalRuntimeClient(provider, client, TimeSpan.FromMinutes(2));
        });

        return services;
    }

    private static void ConfigureCrystalRuntimeClient(
        IServiceProvider provider,
        HttpClient client,
        TimeSpan timeout)
    {
        var options = provider.GetRequiredService<IOptions<CrystalReportStorageOptions>>().Value;
        if (options.RuntimeEnabled && Uri.TryCreate(options.RuntimeBaseUrl, UriKind.Absolute, out var baseAddress))
            client.BaseAddress = new Uri(baseAddress.AbsoluteUri.TrimEnd('/') + "/", UriKind.Absolute);
        client.Timeout = timeout;
    }

    private static bool IsValidRuntimeBaseUrl(string runtimeBaseUrl)
    {
        if (string.IsNullOrWhiteSpace(runtimeBaseUrl))
            return false;
        return Uri.TryCreate(runtimeBaseUrl, UriKind.Absolute, out var uri) &&
               uri.Scheme is "http" or "https" &&
               string.IsNullOrEmpty(uri.UserInfo);
    }

    private static bool HasRuntimeApiKey(CrystalReportStorageOptions options) =>
        !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY")) ||
        !string.IsNullOrWhiteSpace(options.RuntimeApiKey);
}

