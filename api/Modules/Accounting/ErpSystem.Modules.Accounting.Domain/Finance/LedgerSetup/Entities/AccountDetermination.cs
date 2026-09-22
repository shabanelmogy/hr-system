using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class AccountMapping : CompanyAuditableEntity
{
    private AccountMapping()
    {
    }

    public AccountMapping(
        int bookId,
        string purposeCode,
        AccountMappingSourceType sourceType,
        string? sourceReferenceId,
        int accountId,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo)
    {
        BookId = Positive(bookId, nameof(bookId));
        PurposeCode = Required(purposeCode, nameof(purposeCode)).ToUpperInvariant();
        SourceType = Defined(sourceType, nameof(sourceType));
        SourceReferenceId = NormalizeSourceReference(sourceType, sourceReferenceId);
        AccountId = Positive(accountId, nameof(accountId));
        ChangeEffectiveRange(effectiveFrom, effectiveTo);
    }

    public int Id { get; private set; }
    public int BookId { get; private set; }
    public Book Book { get; private set; } = null!;
    public string PurposeCode { get; private set; } = string.Empty;
    public AccountMappingSourceType SourceType { get; private set; }
    public string? SourceReferenceId { get; private set; }
    public int AccountId { get; private set; }
    public Account Account { get; private set; } = null!;
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }

    public void ChangeTarget(int accountId) =>
        AccountId = Positive(accountId, nameof(accountId));

    public void ChangeDefinition(int bookId, string purposeCode, AccountMappingSourceType sourceType, string? sourceReferenceId)
    {
        BookId = Positive(bookId, nameof(bookId));
        PurposeCode = Required(purposeCode, nameof(purposeCode)).ToUpperInvariant();
        SourceType = Defined(sourceType, nameof(sourceType));
        SourceReferenceId = NormalizeSourceReference(sourceType, sourceReferenceId);
    }

    public void ChangeEffectiveRange(DateOnly effectiveFrom, DateOnly? effectiveTo)
    {
        if (effectiveTo.HasValue && effectiveTo.Value < effectiveFrom)
        {
            throw new DomainRuleException(
                "Finance.AccountMapping.InvalidEffectiveRange",
                "Account-mapping effective end date cannot precede its start date.");
        }

        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
    }

    private static string? NormalizeSourceReference(
        AccountMappingSourceType sourceType,
        string? sourceReferenceId)
    {
        if (sourceType == AccountMappingSourceType.Company)
        {
            if (!string.IsNullOrWhiteSpace(sourceReferenceId))
            {
                throw new DomainRuleException(
                    "Finance.AccountMapping.CompanyReferenceNotAllowed",
                    "Company-purpose mappings do not accept a source reference.");
            }

            return null;
        }

        throw new DomainRuleException(
            "Finance.AccountMapping.UnsupportedSourceType",
            "The requested mapping source type is not available in the current Accounting contracts.");
    }
}

public sealed class PostingProfile : CompanyAuditableEntity
{
    private PostingProfile()
    {
    }

    public PostingProfile(
        int bookId,
        string code,
        string nameAr,
        string nameEn,
        string purposeCode,
        PostingProfileContextType contextType,
        string? contextReferenceId,
        int accountId,
        int priority,
        int version,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo)
    {
        BookId = Positive(bookId, nameof(bookId));
        UpdateIdentity(code, nameAr, nameEn, purposeCode);
        ContextType = Defined(contextType, nameof(contextType));
        ContextReferenceId = NormalizeContextReference(contextType, contextReferenceId);
        AccountId = Positive(accountId, nameof(accountId));
        ChangeResolutionPolicy(priority, version, effectiveFrom, effectiveTo);
    }

    public int Id { get; private set; }
    public int BookId { get; private set; }
    public Book Book { get; private set; } = null!;
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string PurposeCode { get; private set; } = string.Empty;
    public PostingProfileContextType ContextType { get; private set; }
    public string? ContextReferenceId { get; private set; }
    public int AccountId { get; private set; }
    public Account Account { get; private set; } = null!;
    public int Priority { get; private set; }
    public int Version { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }

    public void UpdateIdentity(string code, string nameAr, string nameEn, string purposeCode)
    {
        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
        PurposeCode = Required(purposeCode, nameof(purposeCode)).ToUpperInvariant();
    }

    public void ChangeTarget(int accountId) =>
        AccountId = Positive(accountId, nameof(accountId));

    public void ChangeDefinition(int bookId, PostingProfileContextType contextType, string? contextReferenceId)
    {
        BookId = Positive(bookId, nameof(bookId));
        ContextType = Defined(contextType, nameof(contextType));
        ContextReferenceId = NormalizeContextReference(contextType, contextReferenceId);
    }

    public void ChangeResolutionPolicy(
        int priority,
        int version,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo)
    {
        if (priority < 0)
            throw new ArgumentOutOfRangeException(nameof(priority), "Posting-profile priority cannot be negative.");
        if (version <= 0)
            throw new ArgumentOutOfRangeException(nameof(version), "Posting-profile version must be positive.");
        if (effectiveTo.HasValue && effectiveTo.Value < effectiveFrom)
        {
            throw new DomainRuleException(
                "Finance.PostingProfile.InvalidEffectiveRange",
                "Posting-profile effective end date cannot precede its start date.");
        }

        Priority = priority;
        Version = version;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
    }

    private static string? NormalizeContextReference(
        PostingProfileContextType contextType,
        string? contextReferenceId)
    {
        if (contextType == PostingProfileContextType.Company)
        {
            if (!string.IsNullOrWhiteSpace(contextReferenceId))
            {
                throw new DomainRuleException(
                    "Finance.PostingProfile.CompanyReferenceNotAllowed",
                    "Company posting profiles do not accept a context reference.");
            }

            return null;
        }

        throw new DomainRuleException(
            "Finance.PostingProfile.UnsupportedContextType",
            "The requested posting-profile context is not available in the current Accounting contracts.");
    }
}
