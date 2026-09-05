using HrManagementSystem.Domain.Employees.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Recruitment.Entities;
using HrManagementSystem.Domain.Recruitment.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

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
        builder.Property(x => x.Type).HasDefaultValue(RequisitionType.NewPosition);
        builder.Property(x => x.IsBudgeted).HasDefaultValue(true);
        builder.Property(x => x.BudgetJustification).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.RequisitionNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.Status });

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

        builder.HasOne<Employee>()
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.ReplacementEmployeeId })
            .HasPrincipalKey(e => new { e.TenantId, e.CompanyId, e.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
