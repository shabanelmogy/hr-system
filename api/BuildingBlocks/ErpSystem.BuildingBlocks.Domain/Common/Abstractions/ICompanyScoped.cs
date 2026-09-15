namespace ErpSystem.BuildingBlocks.Domain.Abstractions;

public interface ICompanyScoped : ITenantScoped
{
    int CompanyId { get; set; }
}
