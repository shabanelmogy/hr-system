namespace ErpSystem.Modules.Accounting.Contracts.Authorization;

public static class AccountingPermissions
{
    public const string ViewFiscalYears = "FiscalYears:View";
    public const string CreateFiscalYears = "FiscalYears:Create";
    public const string EditFiscalYears = "FiscalYears:Edit";
    public const string DeleteFiscalYears = "FiscalYears:Delete";
    public const string ManageFiscalYearLifecycle = "FiscalYears:ManageLifecycle";
    public const string GenerateInvoiceQrCode = "Invoices:GenerateQrCode";

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

    public static IReadOnlyList<string> All => [.. FiscalYears, .. Invoicing];
}
