using ErpSystem.Modules.Accounting.Application.Messaging;
using ErpSystem.BuildingBlocks.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using ErpSystem.Modules.Accounting.Application.Parties;
using ErpSystem.Modules.Accounting.Infrastructure.Parties;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.Accounting.Contracts.Reporting;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Reporting;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.FiscalYears.Persistence;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.FiscalYears.Jobs;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Localization;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Abstractions;
using ErpSystem.Modules.Accounting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Accounting.Application.Features.Finance.Invoicing.Queries;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.Invoicing.Services;
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
        services.AddScoped<IAccountingUnitOfWork>(provider => provider.GetRequiredService<AccountingDbContext>());
        services.AddScoped<IFiscalYearReadStore, FiscalYearReadStore>();
        services.AddScoped<IFiscalYearWriteStore, FiscalYearWriteStore>();
        services.AddScoped<IFiscalYearAuditTrail, FiscalYearAuditTrail>();
        services.AddScoped<IFiscalYearChangeScheduler, FiscalYearChangeScheduler>();
        services.AddScoped<FiscalYearChangedJob>();
        services.AddScoped<IFiscalYearPlanningSource, FiscalYearPlanningSource>();
        services.AddScoped<IAccountingReportingSource, AccountingReportingSource>();
        services.AddScoped<IAccountingCurrencyCatalog, AccountingCurrencyCatalog>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Abstractions.ICurrencyReadStore, CurrencyReadStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Abstractions.ICurrencyWriteStore, CurrencyWriteStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IAccountingSettingsReadStore, AccountingSettingsReadStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IAccountingSettingsWriteStore, AccountingSettingsWriteStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IAccountHierarchyLevelStore, AccountHierarchyLevelStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IAccountReadStore, AccountReadStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IAccountWriteStore, AccountWriteStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IDimensionReadStore, DimensionReadStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IDimensionWriteStore, DimensionWriteStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IBookReadStore, BookReadStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IBookWriteStore, BookWriteStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IJournalDefinitionReadStore, JournalDefinitionReadStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IJournalDefinitionWriteStore, JournalDefinitionWriteStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IExchangeRateTypeStore, ExchangeRateTypeStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IExchangeRateStore, ExchangeRateStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IAccountMappingStore, AccountMappingStore>();
        services.AddScoped<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.IPostingProfileStore, PostingProfileStore>();
        services.AddSingleton<ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions.ILedgerSetupLocalizer, AccountingLedgerSetupJsonLocalizer>();
        services.AddSingleton<IInvoiceQrCodeGenerator, InvoiceQrCodeGenerator>();

        return services;
    }
}
