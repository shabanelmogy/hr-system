using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyDomainTests
{
    [Fact]
    public void SetParentCompany_EnforcesHierarchyAndPreventsSelfParent()
    {
        var company = new Company("TECH", "Tech Corp", "شركة التقنية", "USD", "UTC");
        Assert.True(company.IsHoldingCompany);
        Assert.Null(company.ParentCompanyId);

        company.SetParentCompany(5);
        Assert.Equal(5, company.ParentCompanyId);

        typeof(Company).GetProperty(nameof(Company.Id))!.SetValue(company, 5);
        var exception = Assert.Throws<DomainRuleException>(() => company.SetParentCompany(5));
        Assert.Equal("Company.CircularParent", exception.Code);
    }
}
