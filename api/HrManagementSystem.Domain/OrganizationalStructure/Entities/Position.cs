using HrManagementSystem.Domain.Common.Entities;
using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.OrganizationalStructure.Entities;

public class Position : CompanyAuditableEntity
{
    private Position()
    {
    }

    public Position(
        string positionCode,
        int jobTitleId,
        int divisionId,
        int jobLevelId,
        int targetHeadcount)
    {
        PositionCode = Required(positionCode, nameof(positionCode)).ToUpperInvariant();
        JobTitleId = Positive(jobTitleId, nameof(jobTitleId));
        DivisionId = Positive(divisionId, nameof(divisionId));
        JobLevelId = Positive(jobLevelId, nameof(jobLevelId));
        SetTargetHeadcount(targetHeadcount);
        IsActive = true;
    }

    public int Id { get; private set; }
    public string PositionCode { get; private set; } = string.Empty;
    public int JobTitleId { get; private set; }
    public JobTitle JobTitle { get; set; } = null!;
    public int DivisionId { get; private set; }
    public Division Division { get; set; } = null!;
    public int JobLevelId { get; private set; }
    public JobLevel JobLevel { get; set; } = null!;
    public int TargetHeadcount { get; private set; }
    public bool IsActive { get; private set; }

    public void SetTargetHeadcount(int targetHeadcount)
    {
        if (targetHeadcount < 0)
            throw new ArgumentOutOfRangeException(nameof(targetHeadcount));

        TargetHeadcount = targetHeadcount;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
