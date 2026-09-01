using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class JobLevel : CompanyAuditableEntity
{
    private JobLevel()
    {
    }

    public JobLevel(string levelCode, string nameEn, string nameAr, int levelOrder)
    {
        UpdateIdentity(levelCode, nameEn, nameAr);
        SetLevelOrder(levelOrder);
    }

    public int Id { get; private set; }
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string LevelCode { get; private set; } = string.Empty;
    public string? DescriptionEn { get; private set; }
    public string? DescriptionAr { get; private set; }
    public int LevelOrder { get; private set; }
    public decimal? MinSalary { get; private set; }
    public decimal? MaxSalary { get; private set; }
    public string? CurrencyCode { get; private set; }
    public bool CanManageOthers { get; private set; }
    public bool IsManagementLevel { get; private set; }

    public ICollection<Position> Positions { get; private set; } = [];

    public void UpdateIdentity(string levelCode, string nameEn, string nameAr)
    {
        LevelCode = Required(levelCode, nameof(levelCode)).ToUpperInvariant();
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
    }

    public void UpdateDetails(
        string? descriptionEn,
        string? descriptionAr,
        int levelOrder,
        bool canManageOthers,
        bool isManagementLevel)
    {
        DescriptionEn = Optional(descriptionEn);
        DescriptionAr = Optional(descriptionAr);
        SetLevelOrder(levelOrder);
        CanManageOthers = canManageOthers;
        IsManagementLevel = isManagementLevel;
    }

    public void SetSalaryRange(decimal? minSalary, decimal? maxSalary, string? currencyCode)
    {
        MinSalary = NonNegativeOrNull(minSalary, nameof(minSalary));
        MaxSalary = NonNegativeOrNull(maxSalary, nameof(maxSalary));
        if (MinSalary.HasValue && MaxSalary.HasValue && MinSalary.Value > MaxSalary.Value)
        {
            throw new DomainRuleException(
                "Organization.JobLevel.InvalidSalaryRange",
                "The minimum salary cannot exceed the maximum salary.");
        }

        CurrencyCode = NormalizeCurrencyCodeOrNull(currencyCode, nameof(currencyCode));
        if ((MinSalary.HasValue || MaxSalary.HasValue) && CurrencyCode is null)
        {
            throw new DomainRuleException(
                "Organization.JobLevel.CurrencyRequired",
                "A currency code is required when a salary boundary is configured.");
        }
    }

    private void SetLevelOrder(int levelOrder)
    {
        if (levelOrder < 0)
            throw new ArgumentOutOfRangeException(nameof(levelOrder));

        LevelOrder = levelOrder;
    }
}
