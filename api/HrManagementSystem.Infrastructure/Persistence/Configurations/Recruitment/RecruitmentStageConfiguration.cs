using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class RecruitmentStageConfiguration : IEntityTypeConfiguration<RecruitmentStage>
{
    public void Configure(EntityTypeBuilder<RecruitmentStage> builder)
    {
        builder.ToTable("RecruitmentStages");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.Id });

        builder.Property(x => x.Code).HasMaxLength(64).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Color).HasMaxLength(30).IsRequired();
        builder.Property(x => x.EmailTemplate).HasMaxLength(4000);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Sequence });
    }
}
