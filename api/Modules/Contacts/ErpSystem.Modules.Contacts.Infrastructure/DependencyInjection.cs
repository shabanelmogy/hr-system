using ErpSystem.Modules.Contacts.Application.Messaging;
using ErpSystem.Modules.Contacts.Application.Parties;
using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using ErpSystem.Modules.Contacts.Infrastructure.Parties;
using ErpSystem.Modules.Contacts.Infrastructure.Health;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Contacts.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddContactsInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Contacts")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'Contacts' or 'DefaultConnection' not found.");

        services.AddDbContext<ContactsDbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ContactsDbContext.Schema)));

        services.TryAddSingleton(TimeProvider.System);
        services.AddSingleton<IOptions<ContactsOutboxDispatcherOptions>>(
            Options.Create(ContactsOutboxDispatcherOptions.FromConfiguration(configuration)));
        services.AddScoped<IPartyStore, PartyStore>();
        services.AddScoped<ContactsOutbox>();
        services.AddScoped<IContactsOutbox>(provider =>
            provider.GetRequiredService<ContactsOutbox>());
        services.AddScoped<ContactsOutboxDispatcher>();
        services.AddHealthChecks()
            .AddCheck<ContactsOutboxHealthCheck>(
                "contacts-outbox",
                tags: ["ready"]);

        return services;
    }
}
