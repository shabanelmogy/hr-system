using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class JobOfferConfiguration : IEntityTypeConfiguration<JobOffer>
{
    public void Configure(EntityTypeBuilder<JobOffer> builder)
    {
        builder.ToTable("JobOffers");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.OfferNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.BaseSalary).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(x => x.ResponseReason).HasMaxLength(1000);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.OfferNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId })
            .HasFilter("[Status] IN (1, 2, 3)")
            .IsUnique();

        builder.HasOne<EmploymentApplication>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId })
            .HasPrincipalKey(a => new { a.TenantId, a.CompanyId, a.Id })
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
