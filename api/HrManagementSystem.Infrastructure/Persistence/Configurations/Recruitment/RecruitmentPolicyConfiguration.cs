using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class RecruitmentPolicyConfiguration : IEntityTypeConfiguration<RecruitmentPolicy>
{
    public void Configure(EntityTypeBuilder<RecruitmentPolicy> builder)
    {
        builder.ToTable("RecruitmentPolicies");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.Id });

        builder.Property(x => x.DefaultCurrency).HasMaxLength(10).IsRequired();
        builder.Property(x => x.InboundEmailAlias).HasMaxLength(200);

        builder.HasIndex(x => x.TenantId).IsUnique();
    }
}
