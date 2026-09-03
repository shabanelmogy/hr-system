using System.Reflection;
using HrManagementSystem.Api.Features.OrganizationalStructure.Management.V1;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Queries;
using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Enums;
using HrManagementSystem.Infrastructure.Features.OrganizationalStructure.Management;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Tests;

public sealed class OrganizationalStructureManagementTests
{
    [Fact]
    public async Task CompanyScopedDirectory_FailsClosedAndIsolatesBranches()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using (var first = CreateContext(options, "tenant-1", 11))
        {
            first.Branches.Add(new Branch("HQ", "Cairo", "القاهرة", "Africa/Cairo", new DateOnly(2026, 1, 1)) { TenantId = "tenant-1", CompanyId = 11 });
            await first.SaveChangesAsync();
        }

        await using (var second = CreateContext(options, "tenant-1", 22))
        {
            second.Branches.Add(new Branch("HQ", "Alexandria", "الإسكندرية", "Africa/Cairo", new DateOnly(2026, 1, 1)) { TenantId = "tenant-1", CompanyId = 22 });
            await second.SaveChangesAsync();
            var visible = await second.Branches.AsNoTracking().SingleAsync();
            Assert.Equal(22, visible.CompanyId);
            Assert.Equal("Alexandria", visible.NameEn);
        }

        await using var withoutCompany = CreateContext(options, "tenant-1", null);
        Assert.Empty(await withoutCompany.Branches.AsNoTracking().ToListAsync());
    }

    [Fact]
    public void Model_EnforcesCompanyScopedOrganizationalRelationships()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = CreateContext(options, "tenant-1", 11);

        AssertCompositeForeignKey<Department, Branch>(context, "TenantId", "CompanyId", "BranchId");
        AssertCompositeForeignKey<Department, Department>(context, "TenantId", "CompanyId", "ParentDepartmentId");
        AssertCompositeForeignKey<Division, Department>(context, "TenantId", "CompanyId", "DepartmentId");
        AssertCompositeForeignKey<Position, Division>(context, "TenantId", "CompanyId", "DivisionId");
        AssertCompositeForeignKey<Position, JobTitle>(context, "TenantId", "CompanyId", "JobTitleId");
        AssertCompositeForeignKey<Position, JobLevel>(context, "TenantId", "CompanyId", "JobLevelId");
        AssertCompositeForeignKey<JobDescription, Position>(context, "TenantId", "CompanyId", "PositionId");

        var versionIndex = context.Model.FindEntityType(typeof(JobDescription))!.GetIndexes()
            .Single(index => index.IsUnique && index.Properties.Any(property => property.Name == nameof(JobDescription.Version)));
        Assert.Equal(["TenantId", "CompanyId", "PositionId", "Version"],
            versionIndex.Properties.Select(property => property.Name));
    }

    [Fact]
    public void JobDescription_RequiresCompleteBilingualContentAndAValidPeriod()
    {
        var description = new JobDescription(1, "Accountant", "محاسب", "v1");
        var incomplete = Assert.Throws<DomainRuleException>(() => description.Approve(
            "user-1", new DateOnly(2026, 9, 1), null, DateTimeOffset.UtcNow));
        Assert.Equal("Organization.JobDescription.Incomplete", incomplete.Code);

        description.UpdateContent(
            "Own the ledger", "إدارة دفتر الأستاذ",
            "Close monthly books", "إقفال الدفاتر شهريًا",
            "Accounting degree", "مؤهل محاسبي",
            null, null, 2);
        var invalidPeriod = Assert.Throws<DomainRuleException>(() => description.Approve(
            "user-1", new DateOnly(2026, 9, 1), new DateOnly(2026, 8, 31), DateTimeOffset.UtcNow));
        Assert.Equal("Organization.JobDescription.InvalidEffectivePeriod", invalidPeriod.Code);
    }

    [Fact]
    public void RejectedJobDescription_CanBeEditedAndResubmitted()
    {
        var description = new JobDescription(1, "Accountant", "محاسب", "v1");
        description.Reject("Add measurable responsibilities", DateTimeOffset.UtcNow);

        description.UpdateContent(
            "Own the ledger", "إدارة دفتر الأستاذ",
            "Close monthly books", "إقفال الدفاتر شهريًا",
            "Accounting degree", "مؤهل محاسبي",
            null, null, 2);

        Assert.Equal(JobDescriptionStatus.Draft, description.Status);
        Assert.Null(description.DecisionReason);
        description.Approve("reviewer", new DateOnly(2026, 1, 1), null, DateTimeOffset.UtcNow);
        Assert.Equal(JobDescriptionStatus.Approved, description.Status);
    }

    [Fact]
    public void Controller_UsesDedicatedApprovalPermission()
    {
        var approve = typeof(OrganizationalStructureController)
            .GetMethod(nameof(OrganizationalStructureController.Approve))!;
        var reject = typeof(OrganizationalStructureController)
            .GetMethod(nameof(OrganizationalStructureController.Reject))!;

        Assert.Equal("OrganizationalStructure:ApproveJobDescriptions",
            approve.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal("OrganizationalStructure:ApproveJobDescriptions",
            reject.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal("job-descriptions", OrganizationalResources.JobDescriptions);
    }

    [Fact]
    public void Controller_ExposesAtomicBulkImportEndpoint()
    {
        var bulk = typeof(OrganizationalStructureController)
            .GetMethod(nameof(OrganizationalStructureController.CreateBulk))!;

        Assert.Equal("bulk", bulk.GetCustomAttribute<HttpPostAttribute>()?.Template);
        Assert.Equal("OrganizationalStructure:Create",
            bulk.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    [Fact]
    public void ManagementPageQueries_AreTranslatableBySqlServerForEveryResourceAndSearchOperator()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=OrganizationalStructureTranslation;Trusted_Connection=True")
            .Options;
        using var context = CreateContext(options, "tenant-1", 11);
        var management = new OrganizationalStructureManagement(
            context,
            new TestCurrentActor("tenant-1", 11),
            TimeProvider.System,
            new NoOpScheduler());
        var buildPageQuery = typeof(OrganizationalStructureManagement).GetMethod(
            "BuildPageQuery",
            BindingFlags.Instance | BindingFlags.NonPublic);
        Assert.NotNull(buildPageQuery);

        foreach (var resource in OrganizationalResources.All)
        foreach (var searchField in GetOrganizationalStructureQuery.SearchFields)
        foreach (var searchOperator in GetOrganizationalStructureQuery.SearchOperators)
        {
            var request = new GetOrganizationalStructureQuery
            {
                Resource = resource,
                Search = "test",
                SearchField = searchField,
                SearchOperator = searchOperator,
                Status = resource == OrganizationalResources.JobDescriptions ? "approved" : "active",
                SortBy = "parent",
                SortDirection = "desc"
            };
            var query = Assert.IsAssignableFrom<IQueryable<OrganizationalStructureItem>>(
                buildPageQuery.Invoke(management, [request]));

            var sql = query.Skip(0).Take(10).ToQueryString();

            Assert.Contains("SELECT", sql, StringComparison.OrdinalIgnoreCase);
        }
    }

    [Fact]
    public void Company_SetParentCompany_EnforcesHierarchyAndPreventsSelfParent()
    {
        var company = new Company("TECH", "Tech Corp", "شركة التقنية", "USD", "UTC");
        Assert.True(company.IsHoldingCompany);
        Assert.Null(company.ParentCompanyId);

        company.SetParentCompany(5);
        Assert.Equal(5, company.ParentCompanyId);

        // Reflection to set Id to 5 to simulate persisted entity
        typeof(Company).GetProperty(nameof(Company.Id))!.SetValue(company, 5);
        var ex = Assert.Throws<DomainRuleException>(() => company.SetParentCompany(5));
        Assert.Equal("Company.CircularParent", ex.Code);
    }

    [Fact]
    public void Department_Centralized_AllowsNullBranchId()
    {
        var dept = new Department(null, "HR", "Human Resources", "الموارد البشرية");
        Assert.True(dept.IsCentralized);
        Assert.Null(dept.BranchId);

        dept.MoveToBranch(10);
        Assert.False(dept.IsCentralized);
        Assert.Equal(10, dept.BranchId);

        dept.MoveToBranch(null);
        Assert.True(dept.IsCentralized);
        Assert.Null(dept.BranchId);
    }

    [Fact]
    public void JobDescription_StructuredContent_SupportsDutySectionsSkillsAndEducation()
    {
        var jd = new JobDescription(1, "Senior Developer", "مطور أول", "V1.0");

        var sections = new List<JobDutySection>
        {
            new()
            {
                SectionTitleEn = "Development",
                SectionTitleAr = "التطوير البرمجي",
                WeightPercentage = 60,
                Items = [new JobDutyItem { TextEn = "Write clean code", TextAr = "كتابة كود نظيف", Order = 1 }]
            }
        };

        var skills = new List<JobSkillItem>
        {
            new() { SkillName = "C#", ProficiencyLevel = "Expert", IsMandatory = true }
        };

        var education = new List<JobEducationRequirement>
        {
            new() { DegreeLevel = "Bachelor", FieldOfStudy = "Computer Science", IsRequired = true }
        };

        jd.UpdateStructuredContent(sections, skills, education);

        Assert.Single(jd.DutySections);
        Assert.Equal(60, jd.DutySections.First().WeightPercentage);
        Assert.Single(jd.Skills);
        Assert.Equal("C#", jd.Skills.First().SkillName);
        Assert.Single(jd.EducationRequirements);
    }

    [Fact]
    public void EmployeeAssignment_ReportsToPosition_CanBeSetAndUpdated()
    {
        var assignment = new HrManagementSystem.Domain.Employees.Entities.EmployeeAssignment(
            employeeId: 1,
            positionId: 10,
            branchId: 2,
            departmentId: 3,
            effectiveFrom: new DateOnly(2026, 1, 1),
            isPrimary: true,
            divisionId: null,
            reportsToPositionId: 5);

        Assert.Equal(5, assignment.ReportsToPositionId);

        assignment.SetReportsToPosition(8);
        Assert.Equal(8, assignment.ReportsToPositionId);
    }

    private static void AssertCompositeForeignKey<TDependent, TPrincipal>(
        ApplicationDbContext context,
        params string[] expectedProperties)
    {
        var foreignKey = Assert.Single(
            context.Model.FindEntityType(typeof(TDependent))!.GetForeignKeys(),
            item => item.PrincipalEntityType.ClrType == typeof(TPrincipal) &&
                    item.Properties.Select(property => property.Name).SequenceEqual(expectedProperties));
        Assert.Equal(["TenantId", "CompanyId", "Id"],
            foreignKey.PrincipalKey.Properties.Select(property => property.Name));
        Assert.Equal(DeleteBehavior.Restrict, foreignKey.DeleteBehavior);
    }

    private static ApplicationDbContext CreateContext(
        DbContextOptions<ApplicationDbContext> options,
        string? tenantId,
        int? companyId) =>
        new(options, new TestCurrentActor(tenantId, companyId), TimeProvider.System);

    private sealed class TestCurrentActor(string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class NoOpScheduler : IOrganizationalStructureChangeScheduler
    {
        public void Schedule(OrganizationalStructureChange change)
        {
        }
    }
}
