using HrManagementSystem.Domain.Common.Entities;

namespace HrManagementSystem.Domain.Recruitment.Entities;

public sealed class EvaluationCriterion : TenantAuditableEntity
{
    private EvaluationCriterion()
    {
    }

    public EvaluationCriterion(
        string code,
        string titleAr,
        string titleEn,
        string category,
        decimal maxScore,
        decimal weight,
        bool isMandatory,
        string? descriptionAr = null,
        string? descriptionEn = null)
    {
        Code = code;
        TitleAr = titleAr;
        TitleEn = titleEn;
        Category = category;
        MaxScore = maxScore;
        Weight = weight;
        IsMandatory = isMandatory;
        DescriptionAr = descriptionAr;
        DescriptionEn = descriptionEn;
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string TitleAr { get; private set; } = string.Empty;
    public string TitleEn { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public decimal MaxScore { get; private set; } = 5;
    public decimal Weight { get; private set; }
    public bool IsMandatory { get; private set; }
    public string? DescriptionAr { get; private set; }
    public string? DescriptionEn { get; private set; }

    public void Update(
        string titleAr,
        string titleEn,
        string category,
        decimal maxScore,
        decimal weight,
        bool isMandatory,
        string? descriptionAr = null,
        string? descriptionEn = null)
    {
        TitleAr = titleAr;
        TitleEn = titleEn;
        Category = category;
        MaxScore = maxScore;
        Weight = weight;
        IsMandatory = isMandatory;
        DescriptionAr = descriptionAr;
        DescriptionEn = descriptionEn;
    }
}
