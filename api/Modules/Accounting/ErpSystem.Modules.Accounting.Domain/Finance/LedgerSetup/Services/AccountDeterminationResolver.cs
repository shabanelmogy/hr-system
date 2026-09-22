using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Services;

public sealed record AccountResolutionCandidate(
    int RuleId,
    string RuleType,
    int AccountId,
    int Specificity,
    int Priority);

public sealed record AccountResolutionResult(
    AccountResolutionStatus Status,
    int? AccountId,
    IReadOnlyList<AccountResolutionCandidate> MatchedCandidates)
{
    public static AccountResolutionResult Missing() =>
        new(AccountResolutionStatus.Missing, null, []);

    public static AccountResolutionResult Ambiguous(
        IReadOnlyList<AccountResolutionCandidate> candidates) =>
        new(AccountResolutionStatus.Ambiguous, null, candidates);

    public static AccountResolutionResult Resolved(
        AccountResolutionCandidate candidate,
        IReadOnlyList<AccountResolutionCandidate> candidates) =>
        new(AccountResolutionStatus.Resolved, candidate.AccountId, candidates);
}

public static class AccountDeterminationResolver
{
    public static AccountResolutionResult Resolve(
        IEnumerable<AccountResolutionCandidate> candidates)
    {
        ArgumentNullException.ThrowIfNull(candidates);

        var materialized = candidates
            .OrderByDescending(candidate => candidate.Specificity)
            .ThenByDescending(candidate => candidate.Priority)
            .ThenBy(candidate => candidate.RuleType, StringComparer.Ordinal)
            .ThenBy(candidate => candidate.RuleId)
            .ToArray();

        if (materialized.Length == 0)
            return AccountResolutionResult.Missing();

        var bestSpecificity = materialized[0].Specificity;
        var bestPriority = materialized[0].Priority;
        var winners = materialized
            .Where(candidate =>
                candidate.Specificity == bestSpecificity &&
                candidate.Priority == bestPriority)
            .ToArray();

        return winners.Length == 1
            ? AccountResolutionResult.Resolved(winners[0], materialized)
            : AccountResolutionResult.Ambiguous(winners);
    }
}
