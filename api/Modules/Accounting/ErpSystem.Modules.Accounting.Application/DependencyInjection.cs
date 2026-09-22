using FluentValidation;
using ErpSystem.BuildingBlocks.Application;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Application.Parties;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Errors;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Errors;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Contacts.Contracts;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.Accounting.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddAccountingApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();
        services.AddScoped<FiscalYearErrors>();
        services.AddScoped<CurrencyErrors>();
        services.AddScoped<LedgerSetupErrors>();
        services.AddScoped<AccountingPartyIntegrationConsumer>();
        services.AddScoped<IIntegrationEventHandler<PartyCreatedIntegrationEvent>>(provider =>
            provider.GetRequiredService<AccountingPartyIntegrationConsumer>());
        services.AddScoped<IIntegrationEventHandler<PartyUpdatedIntegrationEvent>>(provider =>
            provider.GetRequiredService<AccountingPartyIntegrationConsumer>());

        return services;
    }
}
