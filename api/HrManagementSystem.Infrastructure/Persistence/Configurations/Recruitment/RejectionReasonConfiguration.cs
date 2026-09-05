using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class RejectionReasonConfiguration : IEntityTypeConfiguration<RejectionReason>
{
    public void Configure(EntityTypeBuilder<RejectionReason> builder)
    {
        builder.ToTable("RecruitmentRejectionReasons");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.Id });

        builder.Property(x => x.Code).HasMaxLength(64).IsRequired();
        builder.Property(x => x.ReasonAr).HasMaxLength(300).IsRequired();
        builder.Property(x => x.ReasonEn).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(64).IsRequired();
        builder.Property(x => x.EmailSubjectAr).HasMaxLength(200);
        builder.Property(x => x.EmailSubjectEn).HasMaxLength(200);
        builder.Property(x => x.EmailBodyAr).HasMaxLength(4000);
        builder.Property(x => x.EmailBodyEn).HasMaxLength(4000);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Category });
    }
}
