using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Employees.Entities;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class CostCenter : CompanyAuditableEntity
{
    private CostCenter()
    {
    }

    public CostCenter(
        string costCenterCode,
        string nameEn,
        string nameAr,
        int? parentCostCenterId = null)
    {
        UpdateIdentity(costCenterCode, nameEn, nameAr);
        ChangeParent(parentCostCenterId);
    }

    public int Id { get; private set; }
    public string CostCenterCode { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string? DescriptionEn { get; private set; }
    public string? DescriptionAr { get; private set; }
    public int? ParentCostCenterId { get; private set; }
    public CostCenter? ParentCostCenter { get; private set; }
    public ICollection<CostCenter> ChildCostCenters { get; private set; } = [];
    public int? ManagerId { get; private set; }
    public Employee? Manager { get; private set; }

    public void UpdateIdentity(string costCenterCode, string nameEn, string nameAr)
    {
        CostCenterCode = Required(costCenterCode, nameof(costCenterCode)).ToUpperInvariant();
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
    }

    public void UpdateDetails(
        string? descriptionEn,
        string? descriptionAr,
        int? managerId)
    {
        DescriptionEn = Optional(descriptionEn);
        DescriptionAr = Optional(descriptionAr);
        ManagerId = PositiveOrNull(managerId, nameof(managerId));
    }

    public void ChangeParent(int? parentCostCenterId)
    {
        var parentId = PositiveOrNull(parentCostCenterId, nameof(parentCostCenterId));
        if (Id > 0 && parentId == Id)
        {
            throw new DomainRuleException(
                "Organization.CostCenter.RecursiveHierarchy",
                "A cost center cannot be its own parent.");
        }

        ParentCostCenterId = parentId;
    }
}
