namespace HrManagementSystem.Domain.Common.Abstractions;

public interface ICompanyScoped : ITenantScoped
{
    int CompanyId { get; set; }
}
