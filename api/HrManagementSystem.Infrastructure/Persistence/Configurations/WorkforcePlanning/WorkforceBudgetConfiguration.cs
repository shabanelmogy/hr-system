using HrManagementSystem.Domain.Finance.FiscalYears.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.WorkforcePlanning.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.WorkforcePlanning;

public sealed class WorkforceBudgetConfiguration : IEntityTypeConfiguration<WorkforceBudget>
{
    public void Configure(EntityTypeBuilder<WorkforceBudget> builder)
    {
        builder.ToTable("WorkforceBudgets");
        builder.HasKey(budget => budget.Id);
        builder.HasAlternateKey(budget => new { budget.TenantId, budget.CompanyId, budget.Id });
        builder.Property(budget => budget.BudgetCode).HasMaxLength(50).IsRequired();
        builder.Property(budget => budget.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(budget => budget.CalculationPolicyVersion).HasMaxLength(20).IsRequired();
        builder.Property(budget => budget.DecisionReason).HasMaxLength(2000);
        builder.Property(budget => budget.Status).HasConversion<int>();
        builder.Ignore(budget => budget.TotalAuthorizedHeadcount);
        builder.Ignore(budget => budget.TotalSalaryBudget);
        builder.Ignore(budget => budget.TotalRecruitmentBudget);
        builder.Ignore(budget => budget.GrandTotalBudget);
        builder.HasIndex(budget => new { budget.TenantId, budget.CompanyId, budget.FiscalYearId, budget.BudgetCode }).IsUnique();
        builder.HasIndex(budget => new { budget.TenantId, budget.CompanyId, budget.WorkforcePlanId }).IsUnique();
        builder.HasIndex(budget => new { budget.TenantId, budget.CompanyId, budget.FiscalYearId })
            .IsUnique()
            .HasDatabaseName("UX_WorkforceBudgets_OneEffectivePerFiscalYear")
            .HasFilter("[Status] = 3 AND [ActivatedOn] IS NOT NULL AND [SupersededOn] IS NULL AND [IsDeleted] = 0");
        builder.HasOne<FiscalYear>()
            .WithMany()
            .HasForeignKey(budget => new { budget.TenantId, budget.CompanyId, budget.FiscalYearId })
            .HasPrincipalKey(year => new { year.TenantId, year.CompanyId, year.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<WorkforcePlan>()
            .WithMany()
            .HasForeignKey(budget => new { budget.TenantId, budget.CompanyId, budget.WorkforcePlanId })
            .HasPrincipalKey(plan => new { plan.TenantId, plan.CompanyId, plan.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(budget => budget.Lines)
            .WithOne(line => line.WorkforceBudget)
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.WorkforceBudgetId })
            .HasPrincipalKey(budget => new { budget.TenantId, budget.CompanyId, budget.Id })
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(budget => budget.Lines).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class WorkforceBudgetLineConfiguration : IEntityTypeConfiguration<WorkforceBudgetLine>
{
    public void Configure(EntityTypeBuilder<WorkforceBudgetLine> builder)
    {
        builder.ToTable("WorkforceBudgetLines");
        builder.HasKey(line => line.Id);
        builder.HasAlternateKey(line => new { line.TenantId, line.CompanyId, line.Id });
        builder.Property(line => line.AllocatedSalaryBudget).HasColumnType("decimal(18,2)");
        builder.Property(line => line.AllocatedRecruitmentBudget).HasColumnType("decimal(18,2)");
        builder.Ignore(line => line.TotalAllocatedBudget);
        builder.HasIndex(line => new { line.TenantId, line.CompanyId, line.WorkforceBudgetId, line.WorkforcePlanLineId }).IsUnique();
        builder.HasOne<WorkforcePlanLine>()
            .WithMany()
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.WorkforcePlanLineId })
            .HasPrincipalKey(planLine => new { planLine.TenantId, planLine.CompanyId, planLine.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Position>()
            .WithMany()
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.PositionId })
            .HasPrincipalKey(position => new { position.TenantId, position.CompanyId, position.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(line => new { line.TenantId, line.CompanyId, line.BranchId })
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
        builder.HasMany(line => line.PeriodAllocations)
            .WithOne(allocation => allocation.WorkforceBudgetLine)
            .HasForeignKey(allocation => new { allocation.TenantId, allocation.CompanyId, allocation.WorkforceBudgetLineId })
            .HasPrincipalKey(line => new { line.TenantId, line.CompanyId, line.Id })
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(line => line.PeriodAllocations).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class WorkforceBudgetPeriodAllocationConfiguration : IEntityTypeConfiguration<WorkforceBudgetPeriodAllocation>
{
    public void Configure(EntityTypeBuilder<WorkforceBudgetPeriodAllocation> builder)
    {
        builder.ToTable("WorkforceBudgetPeriodAllocations");
        builder.HasKey(allocation => allocation.Id);
        builder.HasAlternateKey(allocation => new { allocation.TenantId, allocation.CompanyId, allocation.Id });
        builder.Property(allocation => allocation.AllocatedSalaryCost).HasColumnType("decimal(18,2)");
        builder.Property(allocation => allocation.AllocatedRecruitmentCost).HasColumnType("decimal(18,2)");
        builder.HasIndex(allocation => new { allocation.TenantId, allocation.CompanyId, allocation.WorkforceBudgetLineId, allocation.FiscalPeriodId }).IsUnique();
        builder.HasOne<FiscalPeriod>()
            .WithMany()
            .HasForeignKey(allocation => new { allocation.TenantId, allocation.CompanyId, allocation.FiscalPeriodId })
            .HasPrincipalKey(period => new { period.TenantId, period.CompanyId, period.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class PositionEnvelopeConfiguration : IEntityTypeConfiguration<PositionEnvelope>
{
    public void Configure(EntityTypeBuilder<PositionEnvelope> builder)
    {
        builder.ToTable("PositionEnvelopes");
        builder.HasKey(envelope => envelope.Id);
        builder.HasAlternateKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.Id });
        builder.Property(envelope => envelope.EnvelopeCode).HasMaxLength(50).IsRequired();
        builder.Property(envelope => envelope.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(envelope => envelope.CalculationPolicyVersion).HasMaxLength(20).IsRequired();
        builder.Property(envelope => envelope.AuthorizedSalaryBudget).HasColumnType("decimal(18,2)");
        builder.Property(envelope => envelope.ReservedSalaryBudget).HasColumnType("decimal(18,2)");
        builder.Property(envelope => envelope.ContractedSalaryBudget).HasColumnType("decimal(18,2)");
        builder.Ignore(envelope => envelope.AvailableHeadcount);
        builder.Ignore(envelope => envelope.AvailableSalaryBudget);
        builder.HasIndex(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.EnvelopeCode }).IsUnique();
        builder.HasIndex(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.WorkforceBudgetLineId }).IsUnique();
        builder.HasOne<WorkforceBudget>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.WorkforceBudgetId })
            .HasPrincipalKey(budget => new { budget.TenantId, budget.CompanyId, budget.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<WorkforceBudgetLine>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.WorkforceBudgetLineId })
            .HasPrincipalKey(line => new { line.TenantId, line.CompanyId, line.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<WorkforcePlan>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.WorkforcePlanId })
            .HasPrincipalKey(plan => new { plan.TenantId, plan.CompanyId, plan.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<WorkforcePlanLine>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.WorkforcePlanLineId })
            .HasPrincipalKey(line => new { line.TenantId, line.CompanyId, line.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<FiscalYear>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.FiscalYearId })
            .HasPrincipalKey(year => new { year.TenantId, year.CompanyId, year.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Position>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.PositionId })
            .HasPrincipalKey(position => new { position.TenantId, position.CompanyId, position.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.BranchId })
            .HasPrincipalKey(branch => new { branch.TenantId, branch.CompanyId, branch.Id })
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Department>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.DepartmentId })
            .HasPrincipalKey(department => new { department.TenantId, department.CompanyId, department.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Division>()
            .WithMany()
            .HasForeignKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.DivisionId })
            .HasPrincipalKey(division => new { division.TenantId, division.CompanyId, division.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
