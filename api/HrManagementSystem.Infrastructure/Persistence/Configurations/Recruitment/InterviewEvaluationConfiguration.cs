using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class InterviewEvaluationConfiguration : IEntityTypeConfiguration<InterviewEvaluation>
{
    public void Configure(EntityTypeBuilder<InterviewEvaluation> builder)
    {
        builder.ToTable("InterviewEvaluations");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Score).HasPrecision(5, 2);
        builder.Property(x => x.SkillEvaluationsJson).HasMaxLength(4000);

        builder.HasIndex(x => new { x.InterviewId, x.InterviewerEmployeeId });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.InterviewId });
    }
}
