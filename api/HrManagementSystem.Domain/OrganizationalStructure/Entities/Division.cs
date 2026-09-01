using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Division : CompanyAuditableEntity
{
    private Division()
    {
    }

    public Division(int departmentId, string divisionCode, string nameEn, string nameAr)
    {
        DepartmentId = Positive(departmentId, nameof(departmentId));
        UpdateIdentity(divisionCode, nameEn, nameAr);
    }

    public int Id { get; private set; }
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string DivisionCode { get; private set; } = string.Empty;
    public string? DescriptionEn { get; private set; }
    public string? DescriptionAr { get; private set; }
    public string? CostCenterCode { get; private set; }
    public int DepartmentId { get; private set; }
    public Department Department { get; private set; } = null!;
    public int? ManagerId { get; private set; }
    public Employee? Manager { get; private set; }

    public ICollection<Position> Positions { get; private set; } = [];
    public ICollection<Employee> Employees { get; private set; } = [];

    public void UpdateIdentity(string divisionCode, string nameEn, string nameAr)
    {
        DivisionCode = Required(divisionCode, nameof(divisionCode)).ToUpperInvariant();
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
    }

    public void UpdateDetails(
        string? descriptionEn,
        string? descriptionAr,
        string? costCenterCode,
        int? managerId)
    {
        DescriptionEn = Optional(descriptionEn);
        DescriptionAr = Optional(descriptionAr);
        CostCenterCode = Optional(costCenterCode)?.ToUpperInvariant();
        ManagerId = PositiveOrNull(managerId, nameof(managerId));
    }

    public void MoveToDepartment(int departmentId) =>
        DepartmentId = Positive(departmentId, nameof(departmentId));
}
