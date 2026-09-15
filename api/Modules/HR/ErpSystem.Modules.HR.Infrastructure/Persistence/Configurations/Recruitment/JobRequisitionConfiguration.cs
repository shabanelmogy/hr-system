using ErpSystem.Modules.HR.Domain.Employees.Entities;
using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.HR.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class JobRequisitionConfiguration : IEntityTypeConfiguration<JobRequisition>
{
    public void Configure(EntityTypeBuilder<JobRequisition> builder)
    {
        builder.ToTable("JobRequisitions");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.RequisitionNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.BusinessReason).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.DecisionReason).HasMaxLength(2000);
        builder.Property(x => x.Type)
            .HasDefaultValue(RequisitionType.NewPosition)
            .HasSentinel((RequisitionType)0);
        builder.Property(x => x.IsBudgeted).HasDefaultValue(true);
        builder.Property(x => x.BudgetJustification).HasMaxLength(2000);
        builder.Property(x => x.PlanningSource)
            .HasConversion<int>()
            .HasDefaultValue(PlanningSource.Legacy)
            .HasSentinel((PlanningSource)0);
        builder.Ignore(x => x.ReleasablePositions);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.RequisitionNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.StaffingRequestId });

        builder.HasOne<StaffingRequest>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.StaffingRequestId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Position)
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.PositionId })
            .HasPrincipalKey(p => new { p.TenantId, p.CompanyId, p.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Branch)
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.BranchId })
            .HasPrincipalKey(b => new { b.TenantId, b.CompanyId, b.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Department)
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.DepartmentId })
            .HasPrincipalKey(d => new { d.TenantId, d.CompanyId, d.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Division)
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.DivisionId })
            .HasPrincipalKey(d => new { d.TenantId, d.CompanyId, d.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ReplacementEmployee)
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.ReplacementEmployeeId })
            .HasPrincipalKey(e => new { e.TenantId, e.CompanyId, e.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
