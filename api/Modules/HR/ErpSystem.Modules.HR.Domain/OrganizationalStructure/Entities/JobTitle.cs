using ErpSystem.BuildingBlocks.Domain.Entities;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;

public class JobTitle : CompanyAuditableEntity
{
    private JobTitle()
    {
    }

    public JobTitle(string jobTitleCode, string titleEn, string titleAr) =>
        UpdateIdentity(jobTitleCode, titleEn, titleAr);

    public int Id { get; private set; }
    public string TitleEn { get; private set; } = string.Empty;
    public string TitleAr { get; private set; } = string.Empty;
    public string JobTitleCode { get; private set; } = string.Empty;

    public ICollection<Position> Positions { get; private set; } = [];

    public void UpdateIdentity(string jobTitleCode, string titleEn, string titleAr)
    {
        JobTitleCode = Required(jobTitleCode, nameof(jobTitleCode)).ToUpperInvariant();
        TitleEn = Required(titleEn, nameof(titleEn));
        TitleAr = Required(titleAr, nameof(titleAr));
    }
}
