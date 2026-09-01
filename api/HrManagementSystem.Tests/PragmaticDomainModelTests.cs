using HrManagementSystem.Domain.Appointments.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Employees.Entities;
using HrManagementSystem.Domain.Employees.Enums;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Enums;
using HrManagementSystem.Domain.Security.ApiKeys.Entities;
using HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;

namespace HrManagementSystem.Tests;

public sealed class PragmaticDomainModelTests
{
    private static readonly DateTime UtcNow = new(2026, 8, 11, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void ApiKey_RevokedSecretCannotBeUsedOrUpdated()
    {
        var apiKey = ApiKey.Create(
            new string('A', 64),
            "hrk_example",
            "https://localhost:3000/reports",
            "Reporting",
            UtcNow,
            UtcNow.AddDays(7));

        apiKey.Revoke("No longer required", UtcNow.AddHours(1));

        Assert.Equal("https://localhost:3000", apiKey.ClientUri);
        Assert.False(apiKey.IsUsableAt(UtcNow.AddHours(1)));
        var exception = Assert.Throws<DomainRuleException>(() =>
            apiKey.UpdateDetails(
                "https://localhost:3001",
                "Changed",
                UtcNow.AddDays(8),
                UtcNow.AddHours(2)));
        Assert.Equal("ApiKey.Revoked", exception.Code);
    }

    [Fact]
    public void ApiKey_ReadResponseNeverExposesSecretOrHash()
    {
        var propertyNames = typeof(ApiKeyResponse)
            .GetProperties()
            .Select(property => property.Name)
            .ToHashSet(StringComparer.Ordinal);

        Assert.DoesNotContain("Secret", propertyNames);
        Assert.DoesNotContain("KeyHash", propertyNames);
        Assert.Contains("KeyPrefix", propertyNames);
    }

    [Fact]
    public void Appointment_RejectsInvalidSchedule()
    {
        var start = new DateTimeOffset(UtcNow);
        Assert.Throws<DomainRuleException>(() =>
            new Appointment(start, start, "Interview", false));
    }

    [Fact]
    public void Branch_CannotCloseBeforeOpening()
    {
        var branch = new Branch(
            "CAI",
            "Cairo",
            "Cairo",
            "Africa/Cairo",
            new DateOnly(2026, 1, 1));

        Assert.Throws<DomainRuleException>(() =>
            branch.Close(new DateOnly(2025, 12, 31)));
    }

    [Fact]
    public void Employee_ProtectsLifecycleAndAccountLink()
    {
        var employee = new Employee(
            "EMP-001",
            "Mona",
            "Ali",
            new DateOnly(2026, 1, 1));

        employee.Activate(new DateOnly(2026, 1, 1));
        employee.Suspend("Investigation", new DateOnly(2026, 2, 1));
        employee.Activate(new DateOnly(2026, 2, 10));
        employee.LinkUserAccount("user-1");

        Assert.Equal(EmployeeStatus.Active, employee.Status);
        Assert.Throws<DomainRuleException>(() => employee.LinkUserAccount("user-2"));
    }

    [Fact]
    public void EmployeeAssignment_CannotEndBeforeItStarts()
    {
        var assignment = new EmployeeAssignment(
            1,
            1,
            1,
            1,
            new DateOnly(2026, 2, 1),
            true);

        Assert.Throws<DomainRuleException>(() =>
            assignment.End(new DateOnly(2026, 1, 31)));
    }

    [Fact]
    public void EmployeeContract_RequiresValidTransitions()
    {
        var contract = new EmployeeContract(
            1,
            "CTR-001",
            EmployeeContractType.FixedTerm,
            new DateOnly(2026, 1, 1),
            new DateOnly(2026, 12, 31));

        contract.Activate(new DateOnly(2026, 1, 1));
        contract.Expire(new DateOnly(2026, 12, 31));

        Assert.Equal(EmployeeContractStatus.Expired, contract.Status);
    }

    [Fact]
    public void Position_StoresPlanButNotDerivedOccupancy()
    {
        var position = new Position("POS-001", 1, 1, 1, 3);

        position.SetTargetHeadcount(5);

        Assert.Equal(5, position.TargetHeadcount);
        Assert.Null(typeof(Position).GetProperty("EmployeeCountExists"));
        Assert.Null(typeof(Position).GetProperty("EmployeeCountNeeded"));
    }

    [Fact]
    public void JobDescription_ApprovalLocksDraftContent()
    {
        var description = new JobDescription(1, "Accountant", "Accountant", "1.0");
        description.UpdateContent(
            "Own the ledger",
            "إدارة دفتر الأستاذ",
            "Close monthly books",
            "إقفال الدفاتر شهريًا",
            "Accounting degree",
            "مؤهل محاسبي",
            null,
            null,
            2);

        description.Approve(
            "employee-7",
            new DateOnly(2026, 9, 1),
            null,
            new DateTimeOffset(UtcNow));

        Assert.Equal(JobDescriptionStatus.Approved, description.Status);
        Assert.Throws<DomainRuleException>(() =>
            description.UpdatePreferredQualifications(null, null, "Changed"));
    }
}
