using HrManagementSystem.Domain.Finance.FiscalYears.Enums;

namespace HrManagementSystem.Domain.Finance.FiscalYears.Entities;

public sealed class FiscalPeriod : CompanyAuditableEntity
{
    private FiscalPeriod()
    {
    }

    internal FiscalPeriod(
        int sequence,
        string code,
        string nameAr,
        string nameEn,
        DateOnly startDate,
        DateOnly endDate)
    {
        Sequence = sequence;
        Code = code;
        NameAr = nameAr;
        NameEn = nameEn;
        StartDate = startDate;
        EndDate = endDate;
    }

    public int Id { get; private set; }
    public int FiscalYearId { get; private set; }
    public FiscalYear FiscalYear { get; private set; } = null!;
    public int Sequence { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public FiscalPeriodStatus Status { get; private set; } = FiscalPeriodStatus.Draft;

    internal void UpdateDraft(
        int sequence,
        string code,
        string nameAr,
        string nameEn,
        DateOnly startDate,
        DateOnly endDate)
    {
        Sequence = sequence;
        Code = code;
        NameAr = nameAr;
        NameEn = nameEn;
        StartDate = startDate;
        EndDate = endDate;
    }

    internal void RestoreDraft()
    {
        Status = FiscalPeriodStatus.Draft;
        IsDeleted = false;
        DeletedById = null;
        DeletedOn = null;
        DeletedByPc = null;
    }

    internal void Open() => Status = FiscalPeriodStatus.Open;
    internal void Close() => Status = FiscalPeriodStatus.Closed;
    internal void Lock() => Status = FiscalPeriodStatus.Locked;
}
