using ErpSystem.Modules.Accounting.Application.Messaging;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using ErpSystem.Modules.Accounting.Application.Parties;
using ErpSystem.Modules.Accounting.Infrastructure.Parties;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ErpSystem.Modules.Accounting.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAccountingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Accounting")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'Accounting' or 'DefaultConnection' not found.");

        services.AddDbContext<AccountingDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", AccountingDbContext.Schema)));

        services.TryAddSingleton(TimeProvider.System);
        services.AddScoped<AccountingOutbox>();
        services.AddScoped<IAccountingOutbox>(provider =>
            provider.GetRequiredService<AccountingOutbox>());
        services.AddScoped<AccountingInbox>();
        services.AddScoped<IAccountingInbox>(provider =>
            provider.GetRequiredService<AccountingInbox>());
        services.AddScoped<IAccountingPartyReferenceStore, AccountingPartyReferenceStore>();

        return services;
    }
}
