using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class JournalDefinition : CompanyAuditableEntity
{
    private JournalDefinition()
    {
    }

    public JournalDefinition(
        int bookId,
        string code,
        string nameAr,
        string nameEn,
        string categoryCode,
        string numberPrefix,
        int numberPadding,
        JournalNumberingResetPolicy resetPolicy,
        long nextNumber = 1)
    {
        BookId = Positive(bookId, nameof(bookId));
        Update(
            code,
            nameAr,
            nameEn,
            categoryCode,
            numberPrefix,
            numberPadding,
            resetPolicy,
            nextNumber);
    }

    public int Id { get; private set; }
    public int BookId { get; private set; }
    public Book Book { get; private set; } = null!;
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string CategoryCode { get; private set; } = string.Empty;
    public string NumberPrefix { get; private set; } = string.Empty;
    public int NumberPadding { get; private set; }
    public JournalNumberingResetPolicy ResetPolicy { get; private set; }
    public long NextNumber { get; private set; } = 1;

    public void ChangeBook(int bookId)
    {
        BookId = Positive(bookId, nameof(bookId));
    }

    public void Update(
        string code,
        string nameAr,
        string nameEn,
        string categoryCode,
        string numberPrefix,
        int numberPadding,
        JournalNumberingResetPolicy resetPolicy,
        long nextNumber)
    {
        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
        CategoryCode = Required(categoryCode, nameof(categoryCode)).ToUpperInvariant();
        NumberPrefix = Required(numberPrefix, nameof(numberPrefix)).ToUpperInvariant();
        if (numberPadding is < 1 or > 12)
            throw new ArgumentOutOfRangeException(nameof(numberPadding), "Number padding must be between 1 and 12.");
        if (nextNumber <= 0)
            throw new ArgumentOutOfRangeException(nameof(nextNumber), "Next number must be positive.");
        NumberPadding = numberPadding;
        ResetPolicy = Defined(resetPolicy, nameof(resetPolicy));
        NextNumber = nextNumber;
    }
}
