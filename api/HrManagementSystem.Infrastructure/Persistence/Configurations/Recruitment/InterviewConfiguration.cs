using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class InterviewConfiguration : IEntityTypeConfiguration<Interview>
{
    public void Configure(EntityTypeBuilder<Interview> builder)
    {
        builder.ToTable("Interviews");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.LocationOrMeetingUrl).HasMaxLength(500);
        builder.Property(x => x.CancellationReason).HasMaxLength(1000);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.StartsOn });

        builder.HasOne<EmploymentApplication>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId })
            .HasPrincipalKey(a => new { a.TenantId, a.CompanyId, a.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Participants)
            .WithOne()
            .HasForeignKey(x => x.InterviewId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Participants).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.Evaluations)
            .WithOne()
            .HasForeignKey(x => x.InterviewId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Evaluations).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
