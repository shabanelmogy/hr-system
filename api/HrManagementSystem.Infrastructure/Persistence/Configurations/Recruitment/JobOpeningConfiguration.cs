using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class JobOpeningConfiguration : IEntityTypeConfiguration<JobOpening>
{
    public void Configure(EntityTypeBuilder<JobOpening> builder)
    {
        builder.ToTable("JobOpenings");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.OpeningNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ClosureReason).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.OpeningNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.JobRequisitionId });

        builder.HasOne<JobRequisition>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.JobRequisitionId })
            .HasPrincipalKey(r => new { r.TenantId, r.CompanyId, r.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Position>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.PositionId })
            .HasPrincipalKey(p => new { p.TenantId, p.CompanyId, p.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.BranchId })
            .HasPrincipalKey(b => new { b.TenantId, b.CompanyId, b.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Department>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.DepartmentId })
            .HasPrincipalKey(d => new { d.TenantId, d.CompanyId, d.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Division>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.DivisionId })
            .HasPrincipalKey(d => new { d.TenantId, d.CompanyId, d.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
