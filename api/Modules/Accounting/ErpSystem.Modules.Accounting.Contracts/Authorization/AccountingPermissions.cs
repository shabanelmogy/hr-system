namespace ErpSystem.Modules.Accounting.Contracts.Authorization;

public static class AccountingPermissions
{
    public const string ViewFiscalYears = "FiscalYears:View";
    public const string CreateFiscalYears = "FiscalYears:Create";
    public const string EditFiscalYears = "FiscalYears:Edit";
    public const string DeleteFiscalYears = "FiscalYears:Delete";
    public const string ManageFiscalYearLifecycle = "FiscalYears:ManageLifecycle";
    public const string GenerateInvoiceQrCode = "Invoices:GenerateQrCode";
    public const string ViewAccountingSetup = "AccountingSetup:View";
    public const string ManageAccountingSetup = "AccountingSetup:Manage";
    public const string ViewAccounts = "Accounts:View";
    public const string ManageAccounts = "Accounts:Manage";
    public const string ViewDimensions = "Dimensions:View";
    public const string ManageDimensions = "Dimensions:Manage";

    public static IReadOnlyList<string> FiscalYears { get; } =
    [
        ViewFiscalYears,
        CreateFiscalYears,
        EditFiscalYears,
        DeleteFiscalYears,
        ManageFiscalYearLifecycle
    ];

    public static IReadOnlyList<string> Invoicing { get; } =
    [
        GenerateInvoiceQrCode
    ];

    public static IReadOnlyList<string> LedgerSetup { get; } =
    [
        ViewAccountingSetup,
        ManageAccountingSetup,
        ViewAccounts,
        ManageAccounts,
        ViewDimensions,
        ManageDimensions
    ];

    public static IReadOnlyList<string> All => [.. FiscalYears, .. Invoicing, .. LedgerSetup];
}
