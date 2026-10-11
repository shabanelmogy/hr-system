using ErpSystem.BuildingBlocks.Modularity;

namespace ErpSystem.Api.Modules;

/// <summary>
/// Explicit deterministic module composition for the ERP host.
/// Every runtime module is registered here explicitly in startup order.
/// Reflection or assembly scanning is never used: adding a module means
/// adding one line between the markers below, which keeps startup order
/// visible and lets the modularity tests verify that every module directory
/// on disk is registered exactly once.
/// </summary>
public static class ErpModuleRegistry
{
    /// <summary>
    /// Creates a fresh module list on every call so lifecycle tests and the
    /// host always observe registration order without shared state.
    /// </summary>
    public static IModule[] Create() =>
    [
        // Foundation first (technical platform, then General Data and shared contacts),
        // then business applications, then cross-module reporting. The order is also the
        // application launcher order (owner decision 2026-10-11: General Data is the main
        // module; HR is one business application, not the root of the system).
        // <erp-module-registrations>
        new ErpSystem.Modules.Platform.PlatformModule(),
        new ErpSystem.Modules.ReferenceData.ReferenceDataModule(),
        new ErpSystem.Modules.Contacts.ContactsModule(),
        new ErpSystem.Modules.Accounting.AccountingModule(),
        new ErpSystem.Modules.HR.HRModule(),
        new ErpSystem.Modules.CRM.CrmModule(),
        new ErpSystem.Modules.Inventory.InventoryModule(),
        new ErpSystem.Modules.PointOfSale.PointOfSaleModule(),
        new ErpSystem.Modules.Reporting.ReportingModule(),
        // </erp-module-registrations>
    ];
}
