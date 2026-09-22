using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class Account : CompanyAuditableEntity
{
    private Account()
    {
    }

    public Account(
        string code,
        string nameAr,
        string nameEn,
        int hierarchyLevelId,
        int? parentAccountId,
        bool allowPosting,
        ManualPostingPolicy manualPostingPolicy,
        AccountCurrencyPolicy currencyPolicy,
        int? specificCurrencyId)
    {
        Update(
            code,
            nameAr,
            nameEn,
            hierarchyLevelId,
            parentAccountId,
            allowPosting,
            manualPostingPolicy,
            currencyPolicy,
            specificCurrencyId);
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public int AccountHierarchyLevelId { get; private set; }
    public AccountHierarchyLevel AccountHierarchyLevel { get; private set; } = null!;
    public int? ParentAccountId { get; private set; }
    public Account? ParentAccount { get; private set; }
    public bool AllowPosting { get; private set; }
    public ManualPostingPolicy ManualPostingPolicy { get; private set; }
    public AccountCurrencyPolicy CurrencyPolicy { get; private set; }
    public int? SpecificCurrencyId { get; private set; }
    public Currency? SpecificCurrency { get; private set; }

    public void Update(
        string code,
        string nameAr,
        string nameEn,
        int hierarchyLevelId,
        int? parentAccountId,
        bool allowPosting,
        ManualPostingPolicy manualPostingPolicy,
        AccountCurrencyPolicy currencyPolicy,
        int? specificCurrencyId)
    {
        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
        AccountHierarchyLevelId = Positive(hierarchyLevelId, nameof(hierarchyLevelId));
        ParentAccountId = PositiveOrNull(parentAccountId, nameof(parentAccountId));
        AllowPosting = allowPosting;
        ManualPostingPolicy = Defined(manualPostingPolicy, nameof(manualPostingPolicy));
        CurrencyPolicy = Defined(currencyPolicy, nameof(currencyPolicy));
        SpecificCurrencyId = ValidateCurrencyPolicy(CurrencyPolicy, specificCurrencyId);
    }

    public void EnsureCanAcceptChild()
    {
        if (AllowPosting)
        {
            throw new DomainRuleException(
                "Finance.Account.PostingAccountCannotHaveChildren",
                "An account that allows posting cannot have child accounts.");
        }
    }

    public void EnsureLevelAllowsPosting(bool levelCanPost)
    {
        if (AllowPosting && !levelCanPost)
        {
            throw new DomainRuleException(
                "Finance.Account.LevelDoesNotAllowPosting",
                "The configured hierarchy level does not allow posting accounts.");
        }
    }

    private static int? ValidateCurrencyPolicy(AccountCurrencyPolicy policy, int? specificCurrencyId)
    {
        if (policy == AccountCurrencyPolicy.SpecificCurrency)
        {
            return Positive(
                specificCurrencyId ?? throw new DomainRuleException(
                    "Finance.Account.SpecificCurrencyRequired",
                    "A specific currency is required when the account currency policy is SpecificCurrency."),
                nameof(specificCurrencyId));
        }

        if (specificCurrencyId.HasValue)
        {
            throw new DomainRuleException(
                "Finance.Account.SpecificCurrencyNotAllowed",
                "A specific currency can be set only when the account currency policy is SpecificCurrency.");
        }

        return null;
    }
}
