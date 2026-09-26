namespace ErpSystem.Modules.Accounting.Contracts.Authorization;

public static class AccountingPermissions
{
    public const string ViewFiscalYears = "FiscalYears:View";
    public const string CreateFiscalYears = "FiscalYears:Create";
    public const string EditFiscalYears = "FiscalYears:Edit";
    public const string ArchiveFiscalYears = "FiscalYears:Archive";
    public const string RestoreFiscalYears = "FiscalYears:Restore";
    public const string OpenFiscalYears = "FiscalYears:Open";
    public const string BeginClosingFiscalYears = "FiscalYears:BeginClosing";
    public const string CloseFiscalYears = "FiscalYears:Close";
    public const string LockFiscalYears = "FiscalYears:Lock";
    public const string ReopenFiscalYears = "FiscalYears:Reopen";

    public const string GenerateInvoiceQrCode = "Invoices:GenerateQrCode";

    public const string ViewCurrencies = "Currencies:View";
    public const string CreateCurrencies = "Currencies:Create";
    public const string EditCurrencies = "Currencies:Edit";
    public const string ArchiveCurrencies = "Currencies:Archive";
    public const string RestoreCurrencies = "Currencies:Restore";

    public const string ViewAccountingSettings = "AccountingSettings:View";
    public const string EditAccountingSettings = "AccountingSettings:Edit";

    public const string ViewAccountHierarchyLevels = "AccountHierarchyLevels:View";
    public const string CreateAccountHierarchyLevels = "AccountHierarchyLevels:Create";
    public const string EditAccountHierarchyLevels = "AccountHierarchyLevels:Edit";
    public const string ArchiveAccountHierarchyLevels = "AccountHierarchyLevels:Archive";
    public const string RestoreAccountHierarchyLevels = "AccountHierarchyLevels:Restore";

    public const string ViewAccounts = "Accounts:View";
    public const string CreateAccounts = "Accounts:Create";
    public const string EditAccounts = "Accounts:Edit";
    public const string ArchiveAccounts = "Accounts:Archive";
    public const string RestoreAccounts = "Accounts:Restore";

    public const string ViewDimensionDefinitions = "DimensionDefinitions:View";
    public const string CreateDimensionDefinitions = "DimensionDefinitions:Create";
    public const string EditDimensionDefinitions = "DimensionDefinitions:Edit";
    public const string ArchiveDimensionDefinitions = "DimensionDefinitions:Archive";
    public const string RestoreDimensionDefinitions = "DimensionDefinitions:Restore";

    public const string ViewDimensionValues = "DimensionValues:View";
    public const string CreateDimensionValues = "DimensionValues:Create";
    public const string EditDimensionValues = "DimensionValues:Edit";
    public const string ArchiveDimensionValues = "DimensionValues:Archive";
    public const string RestoreDimensionValues = "DimensionValues:Restore";

    public const string ViewAccountDimensionPolicies = "AccountDimensionPolicies:View";
    public const string EditAccountDimensionPolicies = "AccountDimensionPolicies:Edit";

    public const string ViewBooks = "Books:View";
    public const string CreateBooks = "Books:Create";
    public const string EditBooks = "Books:Edit";
    public const string ArchiveBooks = "Books:Archive";
    public const string RestoreBooks = "Books:Restore";

    public const string ViewJournalDefinitions = "JournalDefinitions:View";
    public const string CreateJournalDefinitions = "JournalDefinitions:Create";
    public const string EditJournalDefinitions = "JournalDefinitions:Edit";
    public const string ArchiveJournalDefinitions = "JournalDefinitions:Archive";
    public const string RestoreJournalDefinitions = "JournalDefinitions:Restore";

    public const string ViewExchangeRateTypes = "ExchangeRateTypes:View";
    public const string CreateExchangeRateTypes = "ExchangeRateTypes:Create";
    public const string EditExchangeRateTypes = "ExchangeRateTypes:Edit";
    public const string ArchiveExchangeRateTypes = "ExchangeRateTypes:Archive";
    public const string RestoreExchangeRateTypes = "ExchangeRateTypes:Restore";

    public const string ViewExchangeRates = "ExchangeRates:View";
    public const string CreateExchangeRates = "ExchangeRates:Create";
    public const string EditExchangeRates = "ExchangeRates:Edit";

    public const string ViewAccountMappings = "AccountMappings:View";
    public const string CreateAccountMappings = "AccountMappings:Create";
    public const string EditAccountMappings = "AccountMappings:Edit";

    public const string ViewPostingProfiles = "PostingProfiles:View";
    public const string CreatePostingProfiles = "PostingProfiles:Create";
    public const string EditPostingProfiles = "PostingProfiles:Edit";
    public const string ResolvePostingProfiles = "PostingProfiles:Resolve";

    public static IReadOnlyList<string> FiscalYears { get; } =
    [
        ViewFiscalYears, CreateFiscalYears, EditFiscalYears, ArchiveFiscalYears, RestoreFiscalYears,
        OpenFiscalYears, BeginClosingFiscalYears, CloseFiscalYears, LockFiscalYears, ReopenFiscalYears
    ];

    public static IReadOnlyList<string> Invoicing { get; } = [GenerateInvoiceQrCode];

    public static IReadOnlyList<string> LedgerSetup { get; } =
    [
        .. FiscalYears,
        ViewCurrencies, CreateCurrencies, EditCurrencies, ArchiveCurrencies, RestoreCurrencies,
        ViewAccountingSettings, EditAccountingSettings,
        ViewAccountHierarchyLevels, CreateAccountHierarchyLevels, EditAccountHierarchyLevels,
        ArchiveAccountHierarchyLevels, RestoreAccountHierarchyLevels,
        ViewAccounts, CreateAccounts, EditAccounts, ArchiveAccounts, RestoreAccounts,
        ViewDimensionDefinitions, CreateDimensionDefinitions, EditDimensionDefinitions,
        ArchiveDimensionDefinitions, RestoreDimensionDefinitions,
        ViewDimensionValues, CreateDimensionValues, EditDimensionValues,
        ArchiveDimensionValues, RestoreDimensionValues,
        ViewAccountDimensionPolicies, EditAccountDimensionPolicies,
        ViewBooks, CreateBooks, EditBooks, ArchiveBooks, RestoreBooks,
        ViewJournalDefinitions, CreateJournalDefinitions, EditJournalDefinitions,
        ArchiveJournalDefinitions, RestoreJournalDefinitions,
        ViewExchangeRateTypes, CreateExchangeRateTypes, EditExchangeRateTypes,
        ArchiveExchangeRateTypes, RestoreExchangeRateTypes,
        ViewExchangeRates, CreateExchangeRates, EditExchangeRates,
        ViewAccountMappings, CreateAccountMappings, EditAccountMappings,
        ViewPostingProfiles, CreatePostingProfiles, EditPostingProfiles, ResolvePostingProfiles
    ];

    public static IReadOnlyList<string> All => [.. Invoicing, .. LedgerSetup];
}
