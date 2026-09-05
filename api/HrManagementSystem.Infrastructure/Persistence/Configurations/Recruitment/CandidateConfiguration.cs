using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class CandidateConfiguration : IEntityTypeConfiguration<Candidate>
{
    public void Configure(EntityTypeBuilder<Candidate> builder)
    {
        builder.ToTable("Candidates");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.Id });

        builder.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.MiddleName).HasMaxLength(100);
        builder.Property(x => x.LastName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(254).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(50);
        builder.Property(x => x.City).HasMaxLength(100);
        builder.Property(x => x.LinkedInUrl).HasMaxLength(500);
        builder.Property(x => x.PortfolioUrl).HasMaxLength(500);
        builder.Property(x => x.PortalUserId).HasMaxLength(128);
        builder.Property(x => x.PrivacyPolicyVersion).HasMaxLength(50);

        builder.HasIndex(x => new { x.TenantId, x.Email }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.PhoneNumber });
        builder.HasIndex(x => new { x.TenantId, x.PortalUserId });

        builder.HasOne<Country>()
            .WithMany()
            .HasForeignKey(x => x.NationalityCountryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Country>()
            .WithMany()
            .HasForeignKey(x => x.CurrentCountryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<State>()
            .WithMany()
            .HasForeignKey(x => x.CurrentStateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
