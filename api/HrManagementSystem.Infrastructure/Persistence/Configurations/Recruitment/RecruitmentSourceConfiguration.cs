using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class RecruitmentSourceConfiguration : IEntityTypeConfiguration<RecruitmentSource>
{
    public void Configure(EntityTypeBuilder<RecruitmentSource> builder)
    {
        builder.ToTable("RecruitmentSources");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.Id });

        builder.Property(x => x.Code).HasMaxLength(64).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Type).HasMaxLength(64).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
    }
}
