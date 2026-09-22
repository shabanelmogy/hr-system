using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class AccountHierarchyLevel : CompanyAuditableEntity
{
    private AccountHierarchyLevel()
    {
    }

    public AccountHierarchyLevel(int levelNumber, string nameAr, string nameEn, bool canPost)
    {
        Update(levelNumber, nameAr, nameEn, canPost);
    }

    public int Id { get; private set; }
    public int LevelNumber { get; private set; }
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public bool CanPost { get; private set; }

    public void Update(int levelNumber, string nameAr, string nameEn, bool canPost)
    {
        LevelNumber = Positive(levelNumber, nameof(levelNumber));
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
        CanPost = canPost;
    }
}
