using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;

public sealed record AccountingSettingsResponse(
    int Id,
    int FunctionalCurrencyId,
    int PrimaryBookId,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record SaveAccountingSettingsRequest(int FunctionalCurrencyId, int PrimaryBookId, string? RowVersion);
public sealed record AccountingSettingsMutation(int FunctionalCurrencyId, int PrimaryBookId, string? RowVersion);
public sealed record RowVersionRequest(string RowVersion);

public sealed record AccountHierarchyLevelResponse(int Id, int LevelNumber, string NameAr, string NameEn, bool CanPost, bool IsDeleted, string RowVersion);
public sealed record AccountHierarchyLevelRequest(int LevelNumber, string NameAr, string NameEn, bool CanPost, string? RowVersion);

public sealed record AccountResponse(
    int Id,
    string Code,
    string NameAr,
    string NameEn,
    int AccountHierarchyLevelId,
    int? ParentAccountId,
    bool AllowPosting,
    ManualPostingPolicy ManualPostingPolicy,
    AccountCurrencyPolicy CurrencyPolicy,
    int? SpecificCurrencyId,
    bool IsDeleted,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record AccountRequest(
    string Code,
    string NameAr,
    string NameEn,
    int AccountHierarchyLevelId,
    int? ParentAccountId,
    bool AllowPosting,
    ManualPostingPolicy ManualPostingPolicy,
    AccountCurrencyPolicy CurrencyPolicy,
    int? SpecificCurrencyId,
    string? RowVersion);

public sealed record AccountLookupResponse(int Id, string Code, string NameAr, string NameEn, bool AllowPosting);
public sealed record AccountTreeNodeResponse(int Id, string Code, string NameAr, string NameEn, bool AllowPosting, IReadOnlyList<AccountTreeNodeResponse> Children);
public sealed record AccountCodeProposalResponse(string Code);
public sealed record AccountListQuery(
    int PageNumber = 1,
    int PageSize = 50,
    string? Search = null,
    string SearchField = "all",
    string SearchOperator = "contains",
    string RecordStatus = "active",
    string SortBy = "code",
    string SortDirection = "asc");

public sealed record DimensionDefinitionResponse(int Id, string Code, string NameAr, string NameEn, DimensionValueSourceKind ValueSource, bool IsDeleted, string RowVersion);
public sealed record DimensionDefinitionRequest(string Code, string NameAr, string NameEn, DimensionValueSourceKind ValueSource, string? RowVersion);
public sealed record DimensionValueResponse(int Id, int DimensionDefinitionId, string Code, string NameAr, string NameEn, bool IsDeleted, string RowVersion);
public sealed record DimensionValueRequest(int DimensionDefinitionId, string Code, string NameAr, string NameEn, string? RowVersion);
public sealed record AccountDimensionPolicyResponse(int Id, int AccountId, int DimensionDefinitionId, DimensionRequirementPolicy Requirement, string RowVersion);
public sealed record AccountDimensionPolicyRequest(int AccountId, int DimensionDefinitionId, DimensionRequirementPolicy Requirement, string? RowVersion);
public sealed record DimensionListQuery(int PageNumber = 1, int PageSize = 50, string? Search = null, string RecordStatus = "active");

public sealed record BookResponse(int Id, string Code, string NameAr, string NameEn, bool IsPrimary, bool IsDeleted, string RowVersion);
public sealed record BookRequest(string Code, string NameAr, string NameEn, string? RowVersion);

public sealed record JournalDefinitionResponse(int Id, int BookId, string Code, string NameAr, string NameEn, string CategoryCode, string NumberPrefix, int NumberPadding, JournalNumberingResetPolicy ResetPolicy, long NextNumber, bool IsDeleted, string RowVersion);
public sealed record JournalDefinitionRequest(int BookId, string Code, string NameAr, string NameEn, string CategoryCode, string NumberPrefix, int NumberPadding, JournalNumberingResetPolicy ResetPolicy, long NextNumber, string? RowVersion);

public sealed record ExchangeRateTypeResponse(int Id, string Code, string NameAr, string NameEn, bool IsDeleted, string RowVersion);
public sealed record ExchangeRateTypeRequest(string Code, string NameAr, string NameEn, string? RowVersion);
public sealed record ExchangeRateResponse(int Id, int ExchangeRateTypeId, int FromCurrencyId, int ToCurrencyId, DateOnly EffectiveFrom, DateOnly? EffectiveTo, int Version, decimal Rate, string RowVersion);
public sealed record ExchangeRateRequest(int ExchangeRateTypeId, int FromCurrencyId, int ToCurrencyId, DateOnly EffectiveFrom, DateOnly? EffectiveTo, int Version, decimal Rate, string? RowVersion);

public sealed record AccountMappingResponse(int Id, int BookId, string PurposeCode, AccountMappingSourceType SourceType, string? SourceReferenceId, int AccountId, DateOnly EffectiveFrom, DateOnly? EffectiveTo, string RowVersion);
public sealed record AccountMappingRequest(int BookId, string PurposeCode, AccountMappingSourceType SourceType, string? SourceReferenceId, int AccountId, DateOnly EffectiveFrom, DateOnly? EffectiveTo, string? RowVersion);

public sealed record PostingProfileResponse(int Id, int BookId, string Code, string NameAr, string NameEn, string PurposeCode, PostingProfileContextType ContextType, string? ContextReferenceId, int AccountId, int Priority, int Version, DateOnly EffectiveFrom, DateOnly? EffectiveTo, string RowVersion);
public sealed record PostingProfileRequest(int BookId, string Code, string NameAr, string NameEn, string PurposeCode, PostingProfileContextType ContextType, string? ContextReferenceId, int AccountId, int Priority, int Version, DateOnly EffectiveFrom, DateOnly? EffectiveTo, string? RowVersion);
public sealed record ResolveAccountPreviewRequest(int BookId, string PurposeCode, DateOnly OnDate, string? ContextReferenceId);
public sealed record ResolveAccountPreviewResponse(AccountResolutionStatus Status, int? AccountId, IReadOnlyList<AccountResolutionCandidateResponse> Candidates);
public sealed record AccountResolutionCandidateResponse(int RuleId, string RuleType, int AccountId, int Specificity, int Priority);

public sealed record LedgerSetupListQuery(int PageNumber = 1, int PageSize = 50, string? Search = null, string RecordStatus = "active");
