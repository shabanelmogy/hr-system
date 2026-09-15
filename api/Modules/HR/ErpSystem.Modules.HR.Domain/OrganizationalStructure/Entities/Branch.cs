using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;

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
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public int? ManagerId { get; private set; }
    public Employee? Manager { get; private set; }
    public bool IsHeadquarters { get; private set; }
    public bool IsActive { get; private set; }

    public ICollection<Department> Departments { get; private set; } = [];
    public ICollection<Employee> Employees { get; private set; } = [];

    public void UpdateIdentity(
        string branchCode,
        string nameEn,
        string nameAr,
        string timeZoneId,
        DateOnly openedOn)
    {
        BranchCode = Required(branchCode, nameof(branchCode)).ToUpperInvariant();
        NameEn = Required(nameEn, nameof(nameEn));
        NameAr = Required(nameAr, nameof(nameAr));
        TimeZoneId = Required(timeZoneId, nameof(timeZoneId));
        OpenedOn = openedOn;

        if (ClosedOn.HasValue && ClosedOn.Value < openedOn)
        {
            throw new DomainRuleException(
                "Organization.Branch.InvalidClosureDate",
                "A branch cannot close before it opens.");
        }
    }

    public void UpdateContact(string? email, string? phone)
    {
        Email = Optional(email);
        Phone = Optional(phone);
    }

    public void AssignManager(int? managerId) =>
        ManagerId = PositiveOrNull(managerId, nameof(managerId));

    public void SetHeadquarters(bool isHeadquarters) => IsHeadquarters = isHeadquarters;

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
