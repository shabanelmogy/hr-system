using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Services;
using ErpSystem.BuildingBlocks.Domain.Exceptions;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class LedgerSetupDomainTests
{
    [Fact]
    public void SpecificCurrencyPolicyRequiresCurrency()
    {
        Assert.Throws<DomainRuleException>(() => new Account("1000", "حساب", "Account", 1, null, true, ManualPostingPolicy.Allowed, AccountCurrencyPolicy.SpecificCurrency, null));
    }

    [Fact]
    public void PostingAccountCannotAcceptChildren()
    {
        var account = new Account("1000", "حساب", "Account", 1, null, true, ManualPostingPolicy.Allowed, AccountCurrencyPolicy.Any, null);
        Assert.Throws<DomainRuleException>(account.EnsureCanAcceptChild);
    }

    [Fact]
    public void ResolverReturnsMissingAndAmbiguousWithoutFallback()
    {
        Assert.Equal(AccountResolutionStatus.Missing, AccountDeterminationResolver.Resolve([]).Status);
        var result = AccountDeterminationResolver.Resolve([
            new AccountResolutionCandidate(1, "PostingProfile", 10, 2, 5),
            new AccountResolutionCandidate(2, "PostingProfile", 11, 2, 5)]);
        Assert.Equal(AccountResolutionStatus.Ambiguous, result.Status);
        Assert.Null(result.AccountId);
    }

    [Fact]
    public void ExchangeRateDefinitionRejectsSameCurrencyPairWhenChanged()
    {
        var rate = new ExchangeRate(1, 10, 20, new DateOnly(2026, 1, 1), null, 1, 1.25m);

        Assert.Throws<DomainRuleException>(() => rate.ChangeDefinition(2, 10, 10));
    }

    [Fact]
    public void JournalDefinitionCanMoveToAnotherBookExplicitly()
    {
        var journal = new JournalDefinition(
            1,
            "GEN",
            "عام",
            "General",
            "GENERAL",
            "GEN-",
            6,
            JournalNumberingResetPolicy.FiscalYear);

        journal.ChangeBook(2);

        Assert.Equal(2, journal.BookId);
    }
}
