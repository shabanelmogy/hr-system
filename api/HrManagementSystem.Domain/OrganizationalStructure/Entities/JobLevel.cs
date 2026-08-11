using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class JobLevel : CompanyAuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string LevelCode { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public int LevelOrder { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? CurrencyCode { get; set; }
    public bool CanManageOthers { get; set; }
    public bool IsManagementLevel { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Position> Positions { get; set; } = [];
}
