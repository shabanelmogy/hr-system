using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class Book : CompanyAuditableEntity
{
    private Book()
    {
    }

    public Book(string code, string nameAr, string nameEn)
    {
        Update(code, nameAr, nameEn);
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public bool IsPrimary { get; private set; } = true;

    public void Update(string code, string nameAr, string nameEn)
    {
        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
    }

    public void EnsurePrimary()
    {
        if (!IsPrimary)
        {
            throw new DomainRuleException(
                "Finance.Book.PrimaryRequired",
                "Core GL V1 supports only the company primary book.");
        }
    }
}
