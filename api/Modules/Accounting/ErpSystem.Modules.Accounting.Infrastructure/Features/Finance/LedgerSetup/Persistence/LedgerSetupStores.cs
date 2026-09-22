using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Services;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;

internal static class LedgerSetupProjection
{
    public static string Version(byte[] version) => Convert.ToBase64String(version);
    public static AccountResponse Account(Account item) => new(item.Id, item.Code, item.NameAr, item.NameEn, item.AccountHierarchyLevelId, item.ParentAccountId, item.AllowPosting, item.ManualPostingPolicy, item.CurrencyPolicy, item.SpecificCurrencyId, item.IsDeleted, item.CreatedOn, item.UpdatedOn, Version(item.RowVersion));
}

internal static class LedgerSetupQueryFilters
{
    public static IQueryable<T> ByRecordStatus<T>(this IQueryable<T> source, string recordStatus)
        where T : AuditableEntity => recordStatus.ToUpperInvariant() switch
        {
            "ALL" => source,
            "ARCHIVED" => source.Where(item => item.IsDeleted),
            _ => source.Where(item => !item.IsDeleted)
        };
}

public sealed class AccountingSettingsReadStore(AccountingDbContext context) : IAccountingSettingsReadStore
{
    public Task<AccountingSettingsResponse?> GetAsync(CancellationToken cancellationToken) =>
        context.AccountingCompanySettings.AsNoTracking().Select(item => new AccountingSettingsResponse(item.Id, item.FunctionalCurrencyId, item.PrimaryBookId, item.CreatedOn, item.UpdatedOn, LedgerSetupProjection.Version(item.RowVersion))).FirstOrDefaultAsync(cancellationToken);
}
public sealed class AccountingSettingsWriteStore(AccountingDbContext context) : IAccountingSettingsWriteStore
{
    public Task<AccountingCompanySettings?> GetForUpdateAsync(CancellationToken cancellationToken) => context.AccountingCompanySettings.FirstOrDefaultAsync(cancellationToken);
    public Task<bool> CurrencyExistsAsync(int id, CancellationToken cancellationToken) => context.Currencies.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> PrimaryBookExistsAsync(int id, CancellationToken cancellationToken) => context.Books.AnyAsync(item => item.Id == id && item.IsPrimary && !item.IsDeleted, cancellationToken);
    public void Add(AccountingCompanySettings settings) => context.AccountingCompanySettings.Add(settings);
    public void ApplyOriginalRowVersion(AccountingCompanySettings settings, byte[] rowVersion) => context.Entry(settings).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class AccountHierarchyLevelStore(AccountingDbContext context) : IAccountHierarchyLevelStore
{
    public async Task<IReadOnlyList<AccountHierarchyLevelResponse>> ListAsync(string recordStatus, CancellationToken cancellationToken) => await context.AccountHierarchyLevels.AsNoTracking().ByRecordStatus(recordStatus).OrderBy(item => item.LevelNumber).ThenBy(item => item.Id).Select(item => new AccountHierarchyLevelResponse(item.Id, item.LevelNumber, item.NameAr, item.NameEn, item.CanPost, item.IsDeleted, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken);
    public Task<AccountHierarchyLevel?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.AccountHierarchyLevels.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken) => context.AccountHierarchyLevels.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> HasPostingAccountsAsync(int id, CancellationToken cancellationToken) => context.Accounts.AnyAsync(item => item.AccountHierarchyLevelId == id && item.AllowPosting && !item.IsDeleted, cancellationToken);
    public Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken) => context.Accounts.AnyAsync(item => item.AccountHierarchyLevelId == id, cancellationToken);
    public Task<bool> LevelNumberExistsAsync(int levelNumber, int? excludedId, CancellationToken cancellationToken) => context.AccountHierarchyLevels.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.LevelNumber == levelNumber, cancellationToken);
    public void Add(AccountHierarchyLevel level) => context.AccountHierarchyLevels.Add(level);
    public void ApplyOriginalRowVersion(AccountHierarchyLevel level, byte[] rowVersion) => context.Entry(level).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class AccountReadStore(AccountingDbContext context) : IAccountReadStore
{
    public async Task<IReadOnlyList<AccountResponse>> ListAsync(AccountListQuery query, CancellationToken cancellationToken)
    {
        var source = context.Accounts.AsNoTracking();
        source = query.RecordStatus.ToUpperInvariant() switch { "ALL" => source, "ARCHIVED" => source.Where(item => item.IsDeleted), _ => source.Where(item => !item.IsDeleted) };
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            source = source.Where(item =>
                EF.Functions.Like(item.Code, pattern)
                || EF.Functions.Like(item.NameEn, pattern)
                || EF.Functions.Like(item.NameAr, pattern));
        }
        return await source.OrderBy(item => item.Code).ThenBy(item => item.Id).Skip((Math.Max(1, query.PageNumber) - 1) * Math.Clamp(query.PageSize, 1, 500)).Take(Math.Clamp(query.PageSize, 1, 500)).Select(item => new AccountResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.AccountHierarchyLevelId, item.ParentAccountId, item.AllowPosting, item.ManualPostingPolicy, item.CurrencyPolicy, item.SpecificCurrencyId, item.IsDeleted, item.CreatedOn, item.UpdatedOn, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken);
    }
    public Task<AccountResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) => context.Accounts.AsNoTracking().Where(item => item.Id == id).Select(item => new AccountResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.AccountHierarchyLevelId, item.ParentAccountId, item.AllowPosting, item.ManualPostingPolicy, item.CurrencyPolicy, item.SpecificCurrencyId, item.IsDeleted, item.CreatedOn, item.UpdatedOn, LedgerSetupProjection.Version(item.RowVersion))).FirstOrDefaultAsync(cancellationToken);
    public async Task<IReadOnlyList<AccountLookupResponse>> LookupAsync(CancellationToken cancellationToken) => await context.Accounts.AsNoTracking().Where(item => !item.IsDeleted).OrderBy(item => item.Code).Select(item => new AccountLookupResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.AllowPosting)).ToListAsync(cancellationToken);
    public async Task<IReadOnlyList<AccountTreeNodeResponse>> TreeAsync(CancellationToken cancellationToken)
    {
        var rows = await context.Accounts.AsNoTracking().Where(item => !item.IsDeleted).OrderBy(item => item.Code).Select(item => new TreeRow(item.Id, item.ParentAccountId, item.Code, item.NameAr, item.NameEn, item.AllowPosting)).ToListAsync(cancellationToken);
        var childrenByParent = rows.Where(item => item.ParentAccountId.HasValue).GroupBy(item => item.ParentAccountId!.Value).ToDictionary(group => group.Key, group => group.ToArray());
        AccountTreeNodeResponse Build(TreeRow row)
        {
            var children = childrenByParent.TryGetValue(row.Id, out var values) ? values.Select(Build).ToArray() : [];
            return new AccountTreeNodeResponse(row.Id, row.Code, row.NameAr, row.NameEn, row.AllowPosting, children);
        }
        var roots = rows.Where(item => !item.ParentAccountId.HasValue).ToArray();
        return roots.Select(Build).ToArray();
    }

    private sealed record TreeRow(int Id, int? ParentAccountId, string Code, string NameAr, string NameEn, bool AllowPosting);
}
public sealed class AccountWriteStore(AccountingDbContext context) : IAccountWriteStore
{
    public Task<Account?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.Accounts.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<AccountHierarchyLevel?> GetLevelAsync(int id, CancellationToken cancellationToken) => context.AccountHierarchyLevels.FirstOrDefaultAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> CurrencyExistsAsync(int id, CancellationToken cancellationToken) => context.Currencies.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public async Task<bool> CreatesCycleAsync(int accountId, int parentAccountId, CancellationToken cancellationToken)
    {
        var parentLinks = await context.Accounts.AsNoTracking()
            .Where(item => !item.IsDeleted)
            .Select(item => new { item.Id, item.ParentAccountId })
            .ToDictionaryAsync(item => item.Id, item => item.ParentAccountId, cancellationToken);
        var visited = new HashSet<int>();
        var current = parentAccountId;
        while (current > 0 && visited.Add(current))
        {
            if (current == accountId)
                return true;
            if (!parentLinks.TryGetValue(current, out var next) || !next.HasValue)
                return false;
            current = next.Value;
        }
        return current == accountId;
    }
    public Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken) => context.Accounts.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.Code == code, cancellationToken);
    public Task<bool> HasChildrenAsync(int id, CancellationToken cancellationToken) => context.Accounts.AnyAsync(item => item.ParentAccountId == id && !item.IsDeleted, cancellationToken);
    public async Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken) => await context.AccountDimensionPolicies.AnyAsync(item => item.AccountId == id, cancellationToken) || await context.AccountMappings.AnyAsync(item => item.AccountId == id, cancellationToken) || await context.PostingProfiles.AnyAsync(item => item.AccountId == id, cancellationToken);
    public void Add(Account account) => context.Accounts.Add(account);
    public void ApplyOriginalRowVersion(Account account, byte[] rowVersion) => context.Entry(account).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class DimensionReadStore(AccountingDbContext context) : IDimensionReadStore
{
    public async Task<IReadOnlyList<DimensionDefinitionResponse>> DefinitionsAsync(DimensionListQuery query, CancellationToken cancellationToken)
    {
        var source = context.DimensionDefinitions.AsNoTracking().ByRecordStatus(query.RecordStatus);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var value = query.Search.Trim();
            source = source.Where(item => item.Code.Contains(value) || item.NameEn.Contains(value) || item.NameAr.Contains(value));
        }

        var pageSize = Math.Clamp(query.PageSize, 1, 500);
        return await source.OrderBy(item => item.Code).ThenBy(item => item.Id)
            .Skip((Math.Max(1, query.PageNumber) - 1) * pageSize)
            .Take(pageSize)
            .Select(item => new DimensionDefinitionResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.ValueSource, item.IsDeleted, LedgerSetupProjection.Version(item.RowVersion)))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DimensionValueResponse>> ValuesAsync(int definitionId, string recordStatus, int pageNumber, int pageSize, CancellationToken cancellationToken) =>
        await context.DimensionValues.AsNoTracking().ByRecordStatus(recordStatus)
            .Where(item => item.DimensionDefinitionId == definitionId)
            .OrderBy(item => item.Code).ThenBy(item => item.Id)
            .Skip((Math.Max(1, pageNumber) - 1) * Math.Clamp(pageSize, 1, 500))
            .Take(Math.Clamp(pageSize, 1, 500))
            .Select(item => new DimensionValueResponse(item.Id, item.DimensionDefinitionId, item.Code, item.NameAr, item.NameEn, item.IsDeleted, LedgerSetupProjection.Version(item.RowVersion)))
            .ToListAsync(cancellationToken);
    public async Task<IReadOnlyList<AccountDimensionPolicyResponse>> PoliciesAsync(int accountId, CancellationToken cancellationToken) => await context.AccountDimensionPolicies.AsNoTracking().Where(item => item.AccountId == accountId).OrderBy(item => item.DimensionDefinitionId).Select(item => new AccountDimensionPolicyResponse(item.Id, item.AccountId, item.DimensionDefinitionId, item.Requirement, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken);
}
public sealed class DimensionWriteStore(AccountingDbContext context) : IDimensionWriteStore
{
    public Task<DimensionDefinition?> GetDefinitionForUpdateAsync(int id, CancellationToken cancellationToken) => context.DimensionDefinitions.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<DimensionValue?> GetValueForUpdateAsync(int id, CancellationToken cancellationToken) => context.DimensionValues.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<AccountDimensionPolicy?> GetPolicyForUpdateAsync(int accountId, int dimensionDefinitionId, CancellationToken cancellationToken) => context.AccountDimensionPolicies.FirstOrDefaultAsync(item => item.AccountId == accountId && item.DimensionDefinitionId == dimensionDefinitionId, cancellationToken);
    public Task<bool> DefinitionCodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken) => context.DimensionDefinitions.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.Code == code, cancellationToken);
    public Task<bool> ValueCodeExistsAsync(int definitionId, string code, int? excludedId, CancellationToken cancellationToken) => context.DimensionValues.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.DimensionDefinitionId == definitionId && item.Code == code, cancellationToken);
    public Task<bool> DefinitionExistsAsync(int id, CancellationToken cancellationToken) => context.DimensionDefinitions.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> AccountExistsAsync(int id, CancellationToken cancellationToken) => context.Accounts.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public async Task<bool> DefinitionIsReferencedAsync(int id, CancellationToken cancellationToken) =>
        await context.DimensionValues.AnyAsync(item => item.DimensionDefinitionId == id && !item.IsDeleted, cancellationToken)
        || await context.AccountDimensionPolicies.AnyAsync(item => item.DimensionDefinitionId == id, cancellationToken);
    public void Add(DimensionDefinition definition) => context.DimensionDefinitions.Add(definition);
    public void Add(DimensionValue value) => context.DimensionValues.Add(value);
    public void Add(AccountDimensionPolicy policy) => context.AccountDimensionPolicies.Add(policy);
    public void ApplyOriginalRowVersion(AuditableEntity entity, byte[] rowVersion) => context.Entry(entity).Property(nameof(AuditableEntity.RowVersion)).OriginalValue = rowVersion;
}

public sealed class BookReadStore(AccountingDbContext context) : IBookReadStore
{
    public async Task<IReadOnlyList<BookResponse>> ListAsync(string recordStatus, CancellationToken cancellationToken) => await context.Books.AsNoTracking().ByRecordStatus(recordStatus).OrderBy(item => item.Code).ThenBy(item => item.Id).Select(item => new BookResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.IsPrimary, item.IsDeleted, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken);
    public Task<BookResponse?> GetByIdAsync(int id, CancellationToken cancellationToken) => context.Books.AsNoTracking().Where(item => item.Id == id).Select(item => new BookResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.IsPrimary, item.IsDeleted, LedgerSetupProjection.Version(item.RowVersion))).FirstOrDefaultAsync(cancellationToken);
}
public sealed class BookWriteStore(AccountingDbContext context) : IBookWriteStore
{
    public Task<Book?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.Books.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken) => context.Books.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.Code == code, cancellationToken);
    public Task<bool> HasPrimaryAsync(CancellationToken cancellationToken) => context.Books.AnyAsync(item => item.IsPrimary && !item.IsDeleted, cancellationToken);
    public async Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken) =>
        await context.AccountingCompanySettings.AnyAsync(item => item.PrimaryBookId == id, cancellationToken)
        || await context.JournalDefinitions.AnyAsync(item => item.BookId == id, cancellationToken)
        || await context.AccountMappings.AnyAsync(item => item.BookId == id, cancellationToken)
        || await context.PostingProfiles.AnyAsync(item => item.BookId == id, cancellationToken);
    public void Add(Book book) => context.Books.Add(book);
    public void ApplyOriginalRowVersion(Book book, byte[] rowVersion) => context.Entry(book).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class JournalDefinitionReadStore(AccountingDbContext context) : IJournalDefinitionReadStore
{
    public async Task<IReadOnlyList<JournalDefinitionResponse>> ListAsync(int? bookId, string recordStatus, int pageNumber, int pageSize, CancellationToken cancellationToken) => await context.JournalDefinitions.AsNoTracking().ByRecordStatus(recordStatus).Where(item => !bookId.HasValue || item.BookId == bookId.Value).OrderBy(item => item.Code).ThenBy(item => item.Id).Skip((Math.Max(1, pageNumber) - 1) * Math.Clamp(pageSize, 1, 500)).Take(Math.Clamp(pageSize, 1, 500)).Select(item => new JournalDefinitionResponse(item.Id, item.BookId, item.Code, item.NameAr, item.NameEn, item.CategoryCode, item.NumberPrefix, item.NumberPadding, item.ResetPolicy, item.NextNumber, item.IsDeleted, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken);
}
public sealed class JournalDefinitionWriteStore(AccountingDbContext context) : IJournalDefinitionWriteStore
{
    public Task<JournalDefinition?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.JournalDefinitions.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<bool> CodeExistsAsync(int bookId, string code, int? excludedId, CancellationToken cancellationToken) => context.JournalDefinitions.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.BookId == bookId && item.Code == code, cancellationToken);
    public Task<bool> BookExistsAsync(int bookId, CancellationToken cancellationToken) => context.Books.AnyAsync(item => item.Id == bookId && !item.IsDeleted, cancellationToken);
    public void Add(JournalDefinition definition) => context.JournalDefinitions.Add(definition);
    public void ApplyOriginalRowVersion(JournalDefinition definition, byte[] rowVersion) => context.Entry(definition).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class ExchangeRateTypeStore(AccountingDbContext context) : IExchangeRateTypeStore
{
    public async Task<IReadOnlyList<ExchangeRateTypeResponse>> ListAsync(string recordStatus, CancellationToken cancellationToken) => await context.ExchangeRateTypes.AsNoTracking().ByRecordStatus(recordStatus).OrderBy(item => item.Code).ThenBy(item => item.Id).Select(item => new ExchangeRateTypeResponse(item.Id, item.Code, item.NameAr, item.NameEn, item.IsDeleted, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken);
    public Task<ExchangeRateType?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.ExchangeRateTypes.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<bool> CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken) => context.ExchangeRateTypes.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.Code == code, cancellationToken);
    public Task<bool> IsReferencedAsync(int id, CancellationToken cancellationToken) => context.ExchangeRates.AnyAsync(item => item.ExchangeRateTypeId == id, cancellationToken);
    public void Add(ExchangeRateType type) => context.ExchangeRateTypes.Add(type);
    public void ApplyOriginalRowVersion(ExchangeRateType type, byte[] rowVersion) => context.Entry(type).Property(item => item.RowVersion).OriginalValue = rowVersion;
}
public sealed class ExchangeRateStore(AccountingDbContext context) : IExchangeRateStore
{
    public async Task<IReadOnlyList<ExchangeRateResponse>> ListAsync(int? rateTypeId, int? fromCurrencyId, int? toCurrencyId, int pageNumber, int pageSize, CancellationToken cancellationToken) => await context.ExchangeRates.AsNoTracking().Where(item => !item.IsDeleted && (!rateTypeId.HasValue || item.ExchangeRateTypeId == rateTypeId.Value) && (!fromCurrencyId.HasValue || item.FromCurrencyId == fromCurrencyId.Value) && (!toCurrencyId.HasValue || item.ToCurrencyId == toCurrencyId.Value)).OrderByDescending(item => item.EffectiveFrom).ThenByDescending(item => item.Version).ThenByDescending(item => item.Id).Skip((Math.Max(1, pageNumber) - 1) * Math.Clamp(pageSize, 1, 500)).Take(Math.Clamp(pageSize, 1, 500)).Select(item => new ExchangeRateResponse(item.Id, item.ExchangeRateTypeId, item.FromCurrencyId, item.ToCurrencyId, item.EffectiveFrom, item.EffectiveTo, item.Version, item.Rate, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken);
    public Task<ExchangeRate?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.ExchangeRates.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<bool> RateTypeExistsAsync(int id, CancellationToken cancellationToken) => context.ExchangeRateTypes.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> CurrencyExistsAsync(int id, CancellationToken cancellationToken) => context.Currencies.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> DuplicateSeriesAsync(ExchangeRateRequest request, int? excludedId, CancellationToken cancellationToken) => context.ExchangeRates.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.ExchangeRateTypeId == request.ExchangeRateTypeId && item.FromCurrencyId == request.FromCurrencyId && item.ToCurrencyId == request.ToCurrencyId && item.EffectiveFrom == request.EffectiveFrom && item.Version == request.Version && !item.IsDeleted, cancellationToken);
    public void Add(ExchangeRate rate) => context.ExchangeRates.Add(rate);
    public void ApplyOriginalRowVersion(ExchangeRate rate, byte[] rowVersion) => context.Entry(rate).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class AccountMappingStore(AccountingDbContext context) : IAccountMappingStore
{
    public async Task<IReadOnlyList<AccountMappingResponse>> ListAsync(string? purposeCode, int pageNumber, int pageSize, CancellationToken cancellationToken) { var normalizedPurposeCode = purposeCode?.Trim().ToUpperInvariant(); return await context.AccountMappings.AsNoTracking().Where(item => !item.IsDeleted && (normalizedPurposeCode == null || item.PurposeCode == normalizedPurposeCode)).OrderBy(item => item.PurposeCode).ThenByDescending(item => item.EffectiveFrom).ThenBy(item => item.Id).Skip((Math.Max(1, pageNumber) - 1) * Math.Clamp(pageSize, 1, 500)).Take(Math.Clamp(pageSize, 1, 500)).Select(item => new AccountMappingResponse(item.Id, item.BookId, item.PurposeCode, item.SourceType, item.SourceReferenceId, item.AccountId, item.EffectiveFrom, item.EffectiveTo, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken); }
    public Task<AccountMapping?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.AccountMappings.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<bool> BookExistsAsync(int id, CancellationToken cancellationToken) => context.Books.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> AccountExistsAsync(int id, CancellationToken cancellationToken) => context.Accounts.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> DuplicateAsync(AccountMappingRequest request, int? excludedId, CancellationToken cancellationToken) { var purposeCode = request.PurposeCode.Trim().ToUpperInvariant(); return context.AccountMappings.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.BookId == request.BookId && item.PurposeCode == purposeCode && item.SourceType == request.SourceType && item.SourceReferenceId == request.SourceReferenceId && item.EffectiveFrom == request.EffectiveFrom && !item.IsDeleted, cancellationToken); }
    public void Add(AccountMapping mapping) => context.AccountMappings.Add(mapping);
    public void ApplyOriginalRowVersion(AccountMapping mapping, byte[] rowVersion) => context.Entry(mapping).Property(item => item.RowVersion).OriginalValue = rowVersion;
}

public sealed class PostingProfileStore(AccountingDbContext context) : IPostingProfileStore
{
    public async Task<IReadOnlyList<PostingProfileResponse>> ListAsync(string? purposeCode, int pageNumber, int pageSize, CancellationToken cancellationToken) { var normalizedPurposeCode = purposeCode?.Trim().ToUpperInvariant(); return await context.PostingProfiles.AsNoTracking().Where(item => !item.IsDeleted && (normalizedPurposeCode == null || item.PurposeCode == normalizedPurposeCode)).OrderBy(item => item.PurposeCode).ThenByDescending(item => item.EffectiveFrom).ThenByDescending(item => item.Priority).ThenBy(item => item.Id).Skip((Math.Max(1, pageNumber) - 1) * Math.Clamp(pageSize, 1, 500)).Take(Math.Clamp(pageSize, 1, 500)).Select(item => new PostingProfileResponse(item.Id, item.BookId, item.Code, item.NameAr, item.NameEn, item.PurposeCode, item.ContextType, item.ContextReferenceId, item.AccountId, item.Priority, item.Version, item.EffectiveFrom, item.EffectiveTo, LedgerSetupProjection.Version(item.RowVersion))).ToListAsync(cancellationToken); }
    public Task<PostingProfile?> GetForUpdateAsync(int id, CancellationToken cancellationToken) => context.PostingProfiles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    public Task<bool> BookExistsAsync(int id, CancellationToken cancellationToken) => context.Books.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> AccountExistsAsync(int id, CancellationToken cancellationToken) => context.Accounts.AnyAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
    public Task<bool> DuplicateAsync(PostingProfileRequest request, int? excludedId, CancellationToken cancellationToken) { var code = request.Code.Trim().ToUpperInvariant(); return context.PostingProfiles.AnyAsync(item => (!excludedId.HasValue || item.Id != excludedId.Value) && item.BookId == request.BookId && item.Code == code && item.Version == request.Version && !item.IsDeleted, cancellationToken); }
    public async Task<IReadOnlyList<AccountResolutionCandidate>> CandidatesAsync(int bookId, string purposeCode, DateOnly onDate, string? contextReferenceId, CancellationToken cancellationToken)
    {
        var normalizedPurposeCode = purposeCode.Trim().ToUpperInvariant();
        var mappings = await context.AccountMappings.AsNoTracking().Where(item => !item.IsDeleted && item.BookId == bookId && item.PurposeCode == normalizedPurposeCode && item.EffectiveFrom <= onDate && (item.EffectiveTo == null || item.EffectiveTo >= onDate)).Select(item => new AccountResolutionCandidate(item.Id, "AccountMapping", item.AccountId, 1, 0)).ToListAsync(cancellationToken);
        var profiles = await context.PostingProfiles.AsNoTracking().Where(item => !item.IsDeleted && item.BookId == bookId && item.PurposeCode == normalizedPurposeCode && item.EffectiveFrom <= onDate && (item.EffectiveTo == null || item.EffectiveTo >= onDate) && (item.ContextReferenceId == null || item.ContextReferenceId == contextReferenceId)).Select(item => new AccountResolutionCandidate(item.Id, "PostingProfile", item.AccountId, item.ContextReferenceId == null ? 1 : 2, item.Priority)).ToListAsync(cancellationToken);
        return mappings.Concat(profiles).ToArray();
    }
    public void Add(PostingProfile profile) => context.PostingProfiles.Add(profile);
    public void ApplyOriginalRowVersion(PostingProfile profile, byte[] rowVersion) => context.Entry(profile).Property(item => item.RowVersion).OriginalValue = rowVersion;
}
