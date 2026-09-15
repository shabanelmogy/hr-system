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
        // <erp-module-registrations>
        new ErpSystem.Modules.HR.HRModule(),
        new ErpSystem.Modules.Accounting.AccountingModule(),
        new ErpSystem.Modules.Platform.PlatformModule(),
        new ErpSystem.Modules.Contacts.ContactsModule(),
        new ErpSystem.Modules.ReferenceData.ReferenceDataModule(),
        new ErpSystem.Modules.Inventory.InventoryModule(),
        new ErpSystem.Modules.CRM.CrmModule(),
        new ErpSystem.Modules.Reporting.ReportingModule(),
        new ErpSystem.Modules.PointOfSale.PointOfSaleModule(),
        // </erp-module-registrations>
    ];
}
