using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Finance.FiscalYears.Entities;
using HrManagementSystem.Domain.Finance.FiscalYears.Enums;

namespace HrManagementSystem.Tests;

public sealed class FiscalYearDomainTests
{
    [Fact]
    public void MonthlyCalendar_GeneratesTwelveContiguousPeriods()
    {
        var year = Create(FiscalPeriodFrequency.Monthly);

        Assert.Equal(FiscalYearStatus.Draft, year.Status);
        Assert.Equal(12, year.Periods.Count);
        Assert.Equal(new DateOnly(2027, 1, 1), year.Periods.First().StartDate);
        Assert.Equal(new DateOnly(2027, 1, 31), year.Periods.First().EndDate);
        Assert.Equal(new DateOnly(2027, 12, 31), year.Periods.Last().EndDate);
        Assert.Equal(Enumerable.Range(1, 12), year.Periods.Select(period => period.Sequence));
    }

    [Fact]
    public void QuarterlyCalendar_GeneratesFourPeriods()
    {
        var year = Create(FiscalPeriodFrequency.Quarterly);

        Assert.Equal(4, year.Periods.Count);
        Assert.Equal(new DateOnly(2027, 3, 31), year.Periods.First().EndDate);
        Assert.Equal("FY-2027-P04", year.Periods.Last().Code);
    }

    [Theory]
    [InlineData(FiscalPeriodFrequency.Monthly, 12)]
    [InlineData(FiscalPeriodFrequency.Quarterly, 4)]
    public void Calendar_WithEndOfMonthStart_HasNoGapsOrOverlaps(
        FiscalPeriodFrequency frequency,
        int expectedCount)
    {
        var year = new FiscalYear(
            "FY-ODD", "سنة مالية", "Fiscal Year",
            new DateOnly(2027, 1, 31), new DateOnly(2028, 1, 30), frequency);
        var periods = year.Periods.OrderBy(period => period.Sequence).ToArray();

        Assert.Equal(expectedCount, periods.Length);
        Assert.Equal(year.StartDate, periods[0].StartDate);
        Assert.Equal(year.EndDate, periods[^1].EndDate);
        for (var index = 1; index < periods.Length; index++)
            Assert.Equal(periods[index - 1].EndDate.AddDays(1), periods[index].StartDate);
    }

    [Fact]
    public void Lifecycle_AdvancesYearAndPeriodsTogether()
    {
        var year = Create(FiscalPeriodFrequency.Monthly);

        Assert.True(year.Open());
        Assert.All(year.Periods, period => Assert.Equal(FiscalPeriodStatus.Open, period.Status));
        Assert.True(year.BeginClosing());
        Assert.True(year.Close());
        Assert.All(year.Periods, period => Assert.Equal(FiscalPeriodStatus.Closed, period.Status));
        Assert.True(year.Lock());
        Assert.All(year.Periods, period => Assert.Equal(FiscalPeriodStatus.Locked, period.Status));
    }

    [Fact]
    public void OpenYear_CannotBeEditedOrArchived()
    {
        var year = Create(FiscalPeriodFrequency.Monthly);
        year.Open();

        Assert.Throws<DomainRuleException>(() => year.UpdateDraft(
            "FY-2028", "السنة المالية 2028", "Fiscal Year 2028",
            new DateOnly(2028, 1, 1), new DateOnly(2028, 12, 31), FiscalPeriodFrequency.Monthly));
        Assert.Throws<DomainRuleException>(year.EnsureCanArchive);
    }

    [Fact]
    public void Calendar_MustCoverExactlyTwelveMonths()
    {
        Assert.Throws<DomainRuleException>(() => new FiscalYear(
            "FY-2027", "السنة المالية 2027", "Fiscal Year 2027",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 30), FiscalPeriodFrequency.Monthly));
    }

    [Fact]
    public void UpdatingDraft_PreservesMatchingPeriodIdentities()
    {
        var year = Create(FiscalPeriodFrequency.Monthly);
        var originalPeriods = year.Periods.ToArray();

        year.UpdateDraft(
            "FY-2027", "السنة المالية المعدلة", "Updated Fiscal Year",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31),
            FiscalPeriodFrequency.Monthly);

        Assert.Equal(12, year.Periods.Count);
        Assert.Equal(originalPeriods, year.Periods);
    }

    [Fact]
    public void UpdatingDraft_RestoresMatchingArchivedPeriodWithoutDuplicatingItsCode()
    {
        var year = Create(FiscalPeriodFrequency.Monthly);
        var archivedPeriod = year.Periods.Last();
        archivedPeriod.IsDeleted = true;

        Assert.Equal(11, year.Periods.Count);

        year.UpdateDraft(
            "FY-2027", "السنة المالية المعدلة", "Updated Fiscal Year",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31),
            FiscalPeriodFrequency.Monthly);

        Assert.Equal(12, year.Periods.Count);
        Assert.Same(archivedPeriod, year.Periods.Last());
        Assert.False(archivedPeriod.IsDeleted);
        Assert.Equal("FY-2027-P12", archivedPeriod.Code);
    }

    private static FiscalYear Create(FiscalPeriodFrequency frequency) => new(
        " fy-2027 ", " السنة المالية 2027 ", " Fiscal Year 2027 ",
        new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31), frequency);
}
