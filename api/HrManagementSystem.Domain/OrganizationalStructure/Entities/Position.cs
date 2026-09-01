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
    }

    public int Id { get; private set; }
    public string PositionCode { get; private set; } = string.Empty;
    public int JobTitleId { get; private set; }
    public JobTitle JobTitle { get; private set; } = null!;
    public int DivisionId { get; private set; }
    public Division Division { get; private set; } = null!;
    public int JobLevelId { get; private set; }
    public JobLevel JobLevel { get; private set; } = null!;
    public int TargetHeadcount { get; private set; }
    public ICollection<JobDescription> JobDescriptions { get; private set; } = [];

    public void UpdateIdentity(string positionCode) =>
        PositionCode = Required(positionCode, nameof(positionCode)).ToUpperInvariant();

    public void UpdateStructure(int jobTitleId, int divisionId, int jobLevelId)
    {
        JobTitleId = Positive(jobTitleId, nameof(jobTitleId));
        DivisionId = Positive(divisionId, nameof(divisionId));
        JobLevelId = Positive(jobLevelId, nameof(jobLevelId));
    }

    public void SetTargetHeadcount(int targetHeadcount)
    {
        if (targetHeadcount < 0)
            throw new ArgumentOutOfRangeException(nameof(targetHeadcount));

        TargetHeadcount = targetHeadcount;
    }
}
