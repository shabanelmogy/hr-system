using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Services;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;

public interface IAccountingSettingsReadStore
{
    Task<AccountingSettingsResponse?> GetAsync(CancellationToken cancellationToken);
}
public interface IAccountingSettingsWriteStore
{
    Task<AccountingCompanySettings?> GetForUpdateAsync(CancellationToken cancellationToken);
    Task<bool> CurrencyExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> PrimaryBookExistsAsync(int id, CancellationToken cancellationToken);
    void Add(AccountingCompanySettings settings);
    void ApplyOriginalRowVersion(AccountingCompanySettings settings, byte[] rowVersion);
}

public interface IAccountHierarchyLevelStore
{
    Task<IReadOnlyList<AccountHierarchyLevelResponse>> ListAsync(string recordStatus, CancellationToken cancellationToken);
    Task<AccountHierarchyLevel?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> HasPostingAccountsAsync(int id, CancellationToken cancellationToken);
    Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken);
    Task<bool> LevelNumberExistsAsync(int levelNumber, int? excludedId, CancellationToken cancellationToken);
    void Add(AccountHierarchyLevel level);
    void ApplyOriginalRowVersion(AccountHierarchyLevel level, byte[] rowVersion);
}

public interface IAccountReadStore
{
    Task<PageResponse<AccountResponse>> ListAsync(AccountListQuery query, CancellationToken cancellationToken);
    Task<AccountCodeProposalResponse> GetCodeProposalAsync(CancellationToken cancellationToken);
    Task<AccountResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<AccountLookupResponse>> LookupAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<AccountTreeNodeResponse>> TreeAsync(CancellationToken cancellationToken);
}
public interface IAccountWriteStore
{
    Task<Account?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<AccountHierarchyLevel?> GetLevelAsync(int id, CancellationToken cancellationToken);
    Task<bool> CurrencyExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> CreatesCycleAsync(int accountId, int parentAccountId, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> HasChildrenAsync(int id, CancellationToken cancellationToken);
    Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken);
    void Add(Account account);
    void ApplyOriginalRowVersion(Account account, byte[] rowVersion);
}

public interface IDimensionReadStore
{
    Task<IReadOnlyList<DimensionDefinitionResponse>> DefinitionsAsync(DimensionListQuery query, CancellationToken cancellationToken);
    Task<IReadOnlyList<DimensionValueResponse>> ValuesAsync(int definitionId, string recordStatus, int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<IReadOnlyList<AccountDimensionPolicyResponse>> PoliciesAsync(int accountId, CancellationToken cancellationToken);
}
public interface IDimensionWriteStore
{
    Task<DimensionDefinition?> GetDefinitionForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<DimensionValue?> GetValueForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<AccountDimensionPolicy?> GetPolicyForUpdateAsync(int accountId, int dimensionDefinitionId, CancellationToken cancellationToken);
    Task<bool> DefinitionCodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> ValueCodeExistsAsync(int definitionId, string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> DefinitionExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> AccountExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> DefinitionIsReferencedAsync(int id, CancellationToken cancellationToken);
    void Add(DimensionDefinition definition);
    void Add(DimensionValue value);
    void Add(AccountDimensionPolicy policy);
    void ApplyOriginalRowVersion(AuditableEntity entity, byte[] rowVersion);
}

public interface IBookReadStore
{
    Task<IReadOnlyList<BookResponse>> ListAsync(string recordStatus, CancellationToken cancellationToken);
    Task<BookResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
}
public interface IBookWriteStore
{
    Task<Book?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> HasPrimaryAsync(CancellationToken cancellationToken);
    Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken);
    void Add(Book book);
    void ApplyOriginalRowVersion(Book book, byte[] rowVersion);
}

public interface IJournalDefinitionReadStore
{
    Task<IReadOnlyList<JournalDefinitionResponse>> ListAsync(int? bookId, string recordStatus, int pageNumber, int pageSize, CancellationToken cancellationToken);
}
public interface IJournalDefinitionWriteStore
{
    Task<JournalDefinition?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(int bookId, string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> BookExistsAsync(int bookId, CancellationToken cancellationToken);
    void Add(JournalDefinition definition);
    void ApplyOriginalRowVersion(JournalDefinition definition, byte[] rowVersion);
}

public interface IExchangeRateTypeStore
{
    Task<IReadOnlyList<ExchangeRateTypeResponse>> ListAsync(string recordStatus, CancellationToken cancellationToken);
    Task<ExchangeRateType?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken);
    void Add(ExchangeRateType type);
    void ApplyOriginalRowVersion(ExchangeRateType type, byte[] rowVersion);
}

public interface IExchangeRateStore
{
    Task<IReadOnlyList<ExchangeRateResponse>> ListAsync(int? rateTypeId, int? fromCurrencyId, int? toCurrencyId, int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<ExchangeRate?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> RateTypeExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> CurrencyExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> DuplicateSeriesAsync(ExchangeRateRequest request, int? excludedId, CancellationToken cancellationToken);
    void Add(ExchangeRate rate);
    void ApplyOriginalRowVersion(ExchangeRate rate, byte[] rowVersion);
}

public interface IAccountMappingStore
{
    Task<IReadOnlyList<AccountMappingResponse>> ListAsync(string? purposeCode, int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<AccountMapping?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> BookExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> AccountExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> DuplicateAsync(AccountMappingRequest request, int? excludedId, CancellationToken cancellationToken);
    void Add(AccountMapping mapping);
    void ApplyOriginalRowVersion(AccountMapping mapping, byte[] rowVersion);
}

public interface IPostingProfileStore
{
    Task<IReadOnlyList<PostingProfileResponse>> ListAsync(string? purposeCode, int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<PostingProfile?> GetForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<bool> BookExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> AccountExistsAsync(int id, CancellationToken cancellationToken);
    Task<bool> DuplicateAsync(PostingProfileRequest request, int? excludedId, CancellationToken cancellationToken);
    Task<IReadOnlyList<AccountResolutionCandidate>> CandidatesAsync(int bookId, string purposeCode, DateOnly onDate, string? contextReferenceId, CancellationToken cancellationToken);
    void Add(PostingProfile profile);
    void ApplyOriginalRowVersion(PostingProfile profile, byte[] rowVersion);
}
