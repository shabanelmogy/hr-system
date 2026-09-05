using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class EvaluationCriterionConfiguration : IEntityTypeConfiguration<EvaluationCriterion>
{
    public void Configure(EntityTypeBuilder<EvaluationCriterion> builder)
    {
        builder.ToTable("RecruitmentEvaluationCriteria");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.Id });

        builder.Property(x => x.Code).HasMaxLength(64).IsRequired();
        builder.Property(x => x.TitleAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.TitleEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(64).IsRequired();
        builder.Property(x => x.MaxScore).HasPrecision(5, 2);
        builder.Property(x => x.Weight).HasPrecision(5, 2);
        builder.Property(x => x.DescriptionAr).HasMaxLength(2000);
        builder.Property(x => x.DescriptionEn).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
    }
}
