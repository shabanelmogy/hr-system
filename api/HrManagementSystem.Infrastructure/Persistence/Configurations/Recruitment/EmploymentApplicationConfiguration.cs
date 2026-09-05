using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class EmploymentApplicationConfiguration : IEntityTypeConfiguration<EmploymentApplication>
{
    public void Configure(EntityTypeBuilder<EmploymentApplication> builder)
    {
        builder.ToTable("EmploymentApplications");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.ExpectedSalaryCurrencyCode).HasMaxLength(3);
        builder.Property(x => x.ExpectedSalary).HasPrecision(18, 2);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.CandidateId, x.JobOpeningId })
            .HasFilter("[Status] IN (1, 2, 3, 4, 5, 6, 7, 8, 9)")
            .IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.JobOpeningId });

        builder.HasOne<Candidate>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CandidateId })
            .HasPrincipalKey(c => new { c.TenantId, c.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<JobOpening>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.JobOpeningId })
            .HasPrincipalKey(o => new { o.TenantId, o.CompanyId, o.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<JobPosting>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.JobPostingId })
            .HasPrincipalKey(p => new { p.TenantId, p.CompanyId, p.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.StatusHistory)
            .WithOne()
            .HasForeignKey(x => x.EmploymentApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.StatusHistory).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
