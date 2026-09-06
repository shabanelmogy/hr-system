using HrManagementSystem.Domain.Finance.FiscalYears.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.WorkforcePlanning.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.WorkforcePlanning;

public sealed class WorkforcePlanConfiguration : IEntityTypeConfiguration<WorkforcePlan>
{
    public void Configure(EntityTypeBuilder<WorkforcePlan> builder)
    {
        builder.ToTable("WorkforcePlans");
        builder.HasKey(plan => plan.Id);
        builder.HasAlternateKey(plan => new { plan.TenantId, plan.CompanyId, plan.Id });
        builder.Property(plan => plan.PlanCode).HasMaxLength(50).IsRequired();
        builder.Property(plan => plan.TitleEn).HasMaxLength(200).IsRequired();
        builder.Property(plan => plan.TitleAr).HasMaxLength(200).IsRequired();
        builder.Property(plan => plan.Description).HasMaxLength(2000);
        builder.Property(plan => plan.Status).HasConversion<int>();
        builder.Property(plan => plan.PlanSeriesId).IsRequired();
        builder.HasIndex(plan => new { plan.TenantId, plan.CompanyId, plan.FiscalYearId, plan.PlanCode, plan.RevisionNumber }).IsUnique();
        builder.HasIndex(plan => new { plan.TenantId, plan.CompanyId, plan.FiscalYearId })
            .IsUnique()
            .HasDatabaseName("UX_WorkforcePlans_OneEffectivePerFiscalYear")
            .HasFilter("[Status] = 4 AND [ActivatedOn] IS NOT NULL AND [SupersededOn] IS NULL AND [IsDeleted] = 0");
        builder.HasOne<FiscalYear>()
            .WithMany()
            .HasForeignKey(plan => new { plan.TenantId, plan.CompanyId, plan.FiscalYearId })
            .HasPrincipalKey(year => new { year.TenantId, year.CompanyId, year.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(plan => plan.Lines)
            .WithOne(line => line.WorkforcePlan)
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.WorkforcePlanId })
            .HasPrincipalKey(plan => new { plan.TenantId, plan.CompanyId, plan.Id })
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(plan => plan.Lines).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class WorkforcePlanLineConfiguration : IEntityTypeConfiguration<WorkforcePlanLine>
{
    public void Configure(EntityTypeBuilder<WorkforcePlanLine> builder)
    {
        builder.ToTable("WorkforcePlanLines");
        builder.HasKey(line => line.Id);
        builder.HasAlternateKey(line => new { line.TenantId, line.CompanyId, line.Id });
        builder.Property(line => line.Justification).HasMaxLength(2000);
        builder.Property(line => line.TargetBranchId).HasColumnName("BranchId");
        builder.Property(line => line.BaselineHeadcount).HasColumnName("CurrentHeadcount");
        builder.Ignore(line => line.TargetHeadcount);
        builder.Ignore(line => line.PlannedHiringSlots);
        builder.HasIndex(line => new { line.TenantId, line.CompanyId, line.WorkforcePlanId, line.PositionId });
        builder.HasOne<Position>()
            .WithMany()
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.PositionId })
            .HasPrincipalKey(position => new { position.TenantId, position.CompanyId, position.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.TargetBranchId })
            .HasPrincipalKey(branch => new { branch.TenantId, branch.CompanyId, branch.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Department>()
            .WithMany()
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.DepartmentId })
            .HasPrincipalKey(department => new { department.TenantId, department.CompanyId, department.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Division>()
            .WithMany()
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.DivisionId })
            .HasPrincipalKey(division => new { division.TenantId, division.CompanyId, division.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(line => line.PeriodTargets)
            .WithOne(target => target.WorkforcePlanLine)
            .HasForeignKey(target => new { target.TenantId, target.CompanyId, target.WorkforcePlanLineId })
            .HasPrincipalKey(line => new { line.TenantId, line.CompanyId, line.Id })
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(line => line.PeriodTargets).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class WorkforcePlanLinePeriodTargetConfiguration : IEntityTypeConfiguration<WorkforcePlanLinePeriodTarget>
{
    public void Configure(EntityTypeBuilder<WorkforcePlanLinePeriodTarget> builder)
    {
        builder.ToTable("WorkforcePlanLinePeriodTargets");
        builder.HasKey(target => target.Id);
        builder.HasAlternateKey(target => new { target.TenantId, target.CompanyId, target.Id });
        builder.HasIndex(target => new { target.TenantId, target.CompanyId, target.WorkforcePlanLineId, target.FiscalPeriodId }).IsUnique();
        builder.HasOne<FiscalPeriod>()
            .WithMany()
            .HasForeignKey(target => new { target.TenantId, target.CompanyId, target.FiscalPeriodId })
            .HasPrincipalKey(period => new { period.TenantId, period.CompanyId, period.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
