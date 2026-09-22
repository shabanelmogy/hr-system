namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;

public enum ManualPostingPolicy
{
    Allowed = 1,
    Restricted = 2,
    Blocked = 3
}

public enum AccountCurrencyPolicy
{
    Any = 1,
    FunctionalOnly = 2,
    SpecificCurrency = 3
}

public enum DimensionRequirementPolicy
{
    Optional = 1,
    Required = 2,
    Forbidden = 3
}

public enum DimensionValueSourceKind
{
    AccountingOwned = 1
}

public enum JournalNumberingResetPolicy
{
    Never = 1,
    FiscalYear = 2
}

public enum AccountMappingSourceType
{
    Company = 1
}

public enum PostingProfileContextType
{
    Company = 1
}

public enum AccountResolutionStatus
{
    Resolved = 1,
    Missing = 2,
    Ambiguous = 3
}
