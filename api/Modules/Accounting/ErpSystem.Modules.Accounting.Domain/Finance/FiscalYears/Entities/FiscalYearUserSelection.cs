namespace ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Entities;

public sealed class FiscalYearUserSelection : CompanyAuditableEntity
{
    private FiscalYearUserSelection()
    {
    }

    public FiscalYearUserSelection(string userId, int? selectedFiscalYearId)
    {
        UserId = string.IsNullOrWhiteSpace(userId)
            ? throw new ArgumentException("A user ID is required.", nameof(userId))
            : userId;
        SetSelectedFiscalYear(selectedFiscalYearId);
    }

    public int Id { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public int? SelectedFiscalYearId { get; private set; }
    public FiscalYear? SelectedFiscalYear { get; private set; }

    public void SetSelectedFiscalYear(int? fiscalYearId)
    {
        if (fiscalYearId is <= 0)
            throw new ArgumentOutOfRangeException(nameof(fiscalYearId));

        SelectedFiscalYearId = fiscalYearId;
    }
}
