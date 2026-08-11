using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class JobTitle : CompanyAuditableEntity
{
    public int Id { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string JobTitleCode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<JobDescription> JobDescriptions { get; set; } = [];
    public ICollection<Position> Positions { get; set; } = [];
}
