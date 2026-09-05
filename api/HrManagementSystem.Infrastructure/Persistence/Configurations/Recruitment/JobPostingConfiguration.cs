using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class JobPostingConfiguration : IEntityTypeConfiguration<JobPosting>
{
    public void Configure(EntityTypeBuilder<JobPosting> builder)
    {
        builder.ToTable("JobPostings");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.Slug).HasMaxLength(150).IsRequired();
        builder.Property(x => x.TitleEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.TitleAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.LocationTextEn).HasMaxLength(200);
        builder.Property(x => x.LocationTextAr).HasMaxLength(200);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Slug }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.JobOpeningId });

        builder.HasOne<JobOpening>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.JobOpeningId })
            .HasPrincipalKey(o => new { o.TenantId, o.CompanyId, o.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
