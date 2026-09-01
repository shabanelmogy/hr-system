using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class JobDescriptionConfiguration : IEntityTypeConfiguration<JobDescription>
{
    public void Configure(EntityTypeBuilder<JobDescription> builder)
    {
        builder.ToTable("JobDescriptions");
        builder.Property(x => x.TitleEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.TitleAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Version).HasMaxLength(30).IsRequired();
        builder.Property(x => x.PurposeEn).HasMaxLength(4000);
        builder.Property(x => x.PurposeAr).HasMaxLength(4000);
        builder.Property(x => x.ResponsibilitiesEn).HasMaxLength(8000);
        builder.Property(x => x.ResponsibilitiesAr).HasMaxLength(8000);
        builder.Property(x => x.RequirementsEn).HasMaxLength(8000);
        builder.Property(x => x.RequirementsAr).HasMaxLength(8000);
        builder.Property(x => x.PreferredQualificationsEn).HasMaxLength(4000);
        builder.Property(x => x.PreferredQualificationsAr).HasMaxLength(4000);
        builder.Property(x => x.RequiredSkills).HasMaxLength(4000);
        builder.Property(x => x.RequiredEducation).HasMaxLength(2000);
        builder.Property(x => x.RevisionNotes).HasMaxLength(2000);
        builder.Property(x => x.DecisionReason).HasMaxLength(2000);
        builder.Property(x => x.ApprovedByUserId).HasMaxLength(450);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.PositionId, x.Version }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.PositionId, x.TitleEn }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.PositionId, x.TitleAr }).IsUnique();
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.HasOne(x => x.Position)
            .WithMany(x => x.JobDescriptions)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.PositionId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
