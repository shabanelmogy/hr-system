namespace HrManagementSystem.Shared.Abstractions;

public interface ICompanyScoped : ITenantScoped
{
    int CompanyId { get; set; }
}
