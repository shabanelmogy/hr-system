using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Finance.FiscalYears.Enums;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Finance.FiscalYears.Entities;

public sealed class FiscalYear : CompanyAuditableEntity
{
    private readonly List<FiscalPeriod> _periods = [];

    private FiscalYear()
    {
    }

    public FiscalYear(
        string code,
        string nameAr,
        string nameEn,
        DateOnly startDate,
        DateOnly endDate,
        FiscalPeriodFrequency periodFrequency)
    {
        ApplyDraft(code, nameAr, nameEn, startDate, endDate, periodFrequency);
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public FiscalPeriodFrequency PeriodFrequency { get; private set; }
    public FiscalYearStatus Status { get; private set; } = FiscalYearStatus.Draft;
    public IReadOnlyCollection<FiscalPeriod> Periods =>
        _periods.Where(period => !period.IsDeleted).ToArray();

    public void UpdateDraft(
        string code,
        string nameAr,
        string nameEn,
        DateOnly startDate,
        DateOnly endDate,
        FiscalPeriodFrequency periodFrequency)
    {
        EnsureDraft("Finance.FiscalYear.NotEditable", "Only a draft fiscal year can be edited.");
        ApplyDraft(code, nameAr, nameEn, startDate, endDate, periodFrequency);
    }

    public bool Open() => Transition(
        FiscalYearStatus.Draft,
        FiscalYearStatus.Open,
        period => period.Open());

    public bool BeginClosing() => Transition(
        FiscalYearStatus.Open,
        FiscalYearStatus.Closing,
        period => period.Open());

    public bool Close() => Transition(
        FiscalYearStatus.Closing,
        FiscalYearStatus.Closed,
        period => period.Close());

    public bool Lock() => Transition(
        FiscalYearStatus.Closed,
        FiscalYearStatus.Locked,
        period => period.Lock());

    public void EnsureCanArchive() =>
        EnsureDraft("Finance.FiscalYear.NotArchivable", "Only a draft fiscal year can be archived.");

    private void ApplyDraft(
        string code,
        string nameAr,
        string nameEn,
        DateOnly startDate,
        DateOnly endDate,
        FiscalPeriodFrequency periodFrequency)
    {
        var normalizedFrequency = Defined(periodFrequency, nameof(periodFrequency));
        var expectedEndDate = startDate.AddYears(1).AddDays(-1);
        if (endDate != expectedEndDate)
        {
            throw new DomainRuleException(
                "Finance.FiscalYear.InvalidDuration",
                "A fiscal year must cover exactly twelve months.");
        }

        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
        StartDate = startDate;
        EndDate = endDate;
        PeriodFrequency = normalizedFrequency;
        RebuildPeriods();
    }

    private void RebuildPeriods()
    {
        var monthsPerPeriod = PeriodFrequency == FiscalPeriodFrequency.Monthly ? 1 : 3;
        var periodCount = 12 / monthsPerPeriod;
        var existingBySequence = _periods.ToDictionary(period => period.Sequence);
        FiscalPeriod? previousPeriod = null;

        for (var index = 0; index < periodCount; index++)
        {
            var sequence = index + 1;
            var periodStart = previousPeriod is null ? StartDate : previousPeriod.EndDate.AddDays(1);
            var periodEnd = sequence == periodCount
                ? EndDate
                : periodStart.AddMonths(monthsPerPeriod).AddDays(-1);
            var code = $"{Code}-P{sequence:00}";
            var nameAr = $"الفترة {sequence}";
            var nameEn = $"Period {sequence}";

            if (existingBySequence.TryGetValue(sequence, out var existingPeriod))
            {
                if (existingPeriod.IsDeleted)
                    existingPeriod.RestoreDraft();
                existingPeriod.UpdateDraft(sequence, code, nameAr, nameEn, periodStart, periodEnd);
                previousPeriod = existingPeriod;
                continue;
            }

            var newPeriod = new FiscalPeriod(sequence, code, nameAr, nameEn, periodStart, periodEnd);
            _periods.Add(newPeriod);
            previousPeriod = newPeriod;
        }

        _periods.RemoveAll(period => !period.IsDeleted && period.Sequence > periodCount);
        _periods.Sort((left, right) => left.Sequence.CompareTo(right.Sequence));
    }

    private bool Transition(
        FiscalYearStatus expected,
        FiscalYearStatus target,
        Action<FiscalPeriod> updatePeriod)
    {
        if (Status == target)
            return false;

        if (Status != expected)
        {
            throw new DomainRuleException(
                "Finance.FiscalYear.InvalidStatusTransition",
                $"The fiscal year cannot move from {Status} to {target}.");
        }

        foreach (var period in _periods.Where(period => !period.IsDeleted))
            updatePeriod(period);

        Status = target;
        return true;
    }

    private void EnsureDraft(string code, string message)
    {
        if (Status != FiscalYearStatus.Draft)
            throw new DomainRuleException(code, message);
    }
}
