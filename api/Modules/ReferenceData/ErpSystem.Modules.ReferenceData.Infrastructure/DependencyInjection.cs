using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using ErpSystem.Modules.ReferenceData.Contracts.CompanyGeography;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.CompanyGeography;
using ErpSystem.Modules.ReferenceData.Contracts.Reporting;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.Reporting;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.States.Abstractions;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Addresses.Jobs;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Addresses.Persistence;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.AddressTypes.Jobs;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.AddressTypes.Persistence;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Countries.Jobs;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Countries.Persistence;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Districts.Jobs;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Districts.Persistence;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.States.Jobs;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.States.Persistence;
using ErpSystem.Modules.ReferenceData.Infrastructure.Mapping;

namespace ErpSystem.Modules.ReferenceData.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddReferenceDataInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ReferenceData")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'ReferenceData' or 'DefaultConnection' not found.");

        services.AddDbContext<ReferenceDataDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ReferenceDataDbContext.Schema)));
        services.AddReferenceDataMapster();
        services.TryAddSingleton(TimeProvider.System);
        services.AddScoped<IReferenceDataCompanyGeographySource, ReferenceDataCompanyGeographySource>();
        services.AddScoped<IReferenceDataReportingSource, ReferenceDataReportingSource>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ReferenceDataDbContext>());
        services.AddScoped<IAddressReadStore, AddressReadStore>();
        services.AddScoped<IAddressWriteStore, AddressWriteStore>();
        services.AddScoped<IAddressAuditTrail, AddressAuditTrail>();
        services.AddScoped<IAddressChangeScheduler, AddressChangeScheduler>();
        services.AddScoped<AddressChangedJob>();

        services.AddScoped<ICountryReadStore, CountryReadStore>();
        services.AddScoped<ICountryWriteStore, CountryWriteStore>();
        services.AddScoped<ICountryAuditTrail, CountryAuditTrail>();
        services.AddScoped<ICountryChangeScheduler, CountryChangeScheduler>();
        services.AddScoped<CountryChangedJob>();

        services.AddScoped<IStateReadStore, StateReadStore>();
        services.AddScoped<IStateWriteStore, StateWriteStore>();
        services.AddScoped<IStateAuditTrail, StateAuditTrail>();
        services.AddScoped<IStateChangeScheduler, StateChangeScheduler>();
        services.AddScoped<StateManagementChangedJob>();

        services.AddScoped<IDistrictReadStore, DistrictReadStore>();
        services.AddScoped<IDistrictWriteStore, DistrictWriteStore>();
        services.AddScoped<IDistrictAuditTrail, DistrictAuditTrail>();
        services.AddScoped<IDistrictChangeScheduler, DistrictChangeScheduler>();
        services.AddScoped<DistrictManagementChangedJob>();

        services.AddScoped<IAddressTypeReadStore, AddressTypeReadStore>();
        services.AddScoped<IAddressTypeWriteStore, AddressTypeWriteStore>();
        services.AddScoped<IAddressTypeAuditTrail, AddressTypeAuditTrail>();
        services.AddScoped<IAddressTypeChangeScheduler, AddressTypeChangeScheduler>();
        services.AddScoped<AddressTypeManagementChangedJob>();
        services.AddScoped<IAddressTypeValidationQueries, AddressTypeValidationQueries>();
        services.AddScoped<ICountryValidationQueries, CountryValidationQueries>();
        services.AddScoped<IDistrictValidationQueries, DistrictValidationQueries>();
        services.AddScoped<IStateValidationQueries, StateValidationQueries>();

        return services;
    }
}
