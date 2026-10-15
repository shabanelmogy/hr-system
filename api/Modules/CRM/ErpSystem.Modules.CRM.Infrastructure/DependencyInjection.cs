using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Abstractions;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Errors;
using ErpSystem.Modules.CRM.Infrastructure.Features.Appointments.Jobs;
using ErpSystem.Modules.CRM.Infrastructure.Features.Appointments.Persistence;
using ErpSystem.BuildingBlocks.Persistence.AuditTrail;

namespace ErpSystem.Modules.CRM.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCrmInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CRM")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'CRM' or 'DefaultConnection' not found.");

        services.AddDbContext<CrmDbContext>((provider, options) =>
            options.UseErpAuditTrail(provider, "crm").UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", CrmDbContext.Schema)));
        services.AddErpAuditTrailSource<CrmDbContext>("crm");
        services.AddScoped<AppointmentErrors>();
        services.AddScoped<IAppointmentReadStore, AppointmentReadStore>();
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IAppointmentChangeScheduler, AppointmentChangeScheduler>();
        services.AddScoped<AppointmentChangedJob>();

        return services;
    }
}
