using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.HR.Infrastructure.Persistence.Configurations.Recruitment;

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
        builder.Property(x => x.AnnualSalarySnapshot).HasPrecision(18, 2);
        builder.Property(x => x.FiscalYearCostSnapshot).HasPrecision(18, 2);
        builder.Property(x => x.ReservationDelta).HasPrecision(18, 2);
        builder.Property(x => x.CalculationPolicyVersion).HasMaxLength(20);
        builder.Property(x => x.ApprovalSubmittedById).HasMaxLength(450);
        builder.Property(x => x.ApprovedById).HasMaxLength(450);
        builder.Property(x => x.ApprovalDecisionReason).HasMaxLength(1000);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.OfferNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId })
            .HasFilter("[Status] IN (1, 2, 3, 7, 8)")
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

public sealed class JobOfferApprovalHistoryConfiguration : IEntityTypeConfiguration<JobOfferApprovalHistory>
{
    public void Configure(EntityTypeBuilder<JobOfferApprovalHistory> builder)
    {
        builder.ToTable("JobOfferApprovalHistory");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Action).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ActorUserId).HasMaxLength(450).IsRequired();
        builder.Property(x => x.Reason).HasMaxLength(1000);
        builder.Property(x => x.FromStatus).HasConversion<int>();
        builder.Property(x => x.ToStatus).HasConversion<int>();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.JobOfferId, x.OccurredOn });
        builder.HasOne<JobOffer>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.JobOfferId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
