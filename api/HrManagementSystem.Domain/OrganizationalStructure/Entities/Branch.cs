using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Employees.Entities;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Branch : CompanyAuditableEntity
{
    private Branch()
    {
    }

    public Branch(string branchCode, string nameEn, string nameAr, string timeZoneId, DateOnly openedOn)
    {
        BranchCode = Required(branchCode, nameof(branchCode)).ToUpperInvariant();
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
        TimeZoneId = Required(timeZoneId, nameof(timeZoneId));
        OpenedOn = openedOn;
        IsActive = true;
    }

    public int Id { get; private set; }
    public string NameEn { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string BranchCode { get; private set; } = string.Empty;
    public string TimeZoneId { get; private set; } = "UTC";
    public DateOnly OpenedOn { get; private set; }
    public DateOnly? ClosedOn { get; private set; }
    public Company Company { get; set; } = null!;
    public int? AddressId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    public bool IsHeadquarters { get; set; }
    public bool IsActive { get; private set; }

    public ICollection<Department> Departments { get; set; } = [];
    public ICollection<Employee> Employees { get; set; } = [];

    public void Close(DateOnly closedOn)
    {
        if (closedOn < OpenedOn)
        {
            throw new DomainRuleException(
                "Organization.Branch.InvalidClosureDate",
                "A branch cannot close before it opens.");
        }

        ClosedOn = closedOn;
        IsActive = false;
    }

    public void Reopen()
    {
        ClosedOn = null;
        IsActive = true;
    }
}
