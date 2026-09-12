using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;

public sealed class WorkforceBudgetReadStore(ApplicationDbContext context) : IWorkforceBudgetReadStore
{
    public async Task<PageResponse<WorkforceBudgetListItemResponse>> GetPageAsync(GetWorkforceBudgetsQuery request, CancellationToken cancellationToken)
    {
        var query = context.WorkforceBudgets.AsNoTracking().Where(budget => !budget.IsDeleted);
        if (request.FiscalYearId.HasValue) query = query.Where(budget => budget.FiscalYearId == request.FiscalYearId.Value);
        if (request.WorkforcePlanId.HasValue) query = query.Where(budget => budget.WorkforcePlanId == request.WorkforcePlanId.Value);
        if (!request.Status.Equals("all", StringComparison.OrdinalIgnoreCase) && Enum.TryParse<WorkforceBudgetStatus>(request.Status, true, out var status))
            query = query.Where(budget => budget.Status == status);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToUpper();
            query = query.Where(budget => budget.BudgetCode.ToUpper().Contains(search));
        }

        query = (request.SortBy.ToUpperInvariant(), request.SortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase)) switch
        {
            ("BUDGETCODE", true) => query.OrderBy(budget => budget.BudgetCode).ThenBy(budget => budget.Id),
            ("BUDGETCODE", false) => query.OrderByDescending(budget => budget.BudgetCode).ThenByDescending(budget => budget.Id),
            ("STATUS", true) => query.OrderBy(budget => budget.Status).ThenBy(budget => budget.Id),
            ("STATUS", false) => query.OrderByDescending(budget => budget.Status).ThenByDescending(budget => budget.Id),
            ("GRANDTOTAL", true) => query.OrderBy(budget => budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedSalaryBudget + line.AllocatedRecruitmentBudget)).ThenBy(budget => budget.Id),
            ("GRANDTOTAL", false) => query.OrderByDescending(budget => budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedSalaryBudget + line.AllocatedRecruitmentBudget)).ThenByDescending(budget => budget.Id),
            ("CREATEDON", true) => query.OrderBy(budget => budget.CreatedOn).ThenBy(budget => budget.Id),
            _ => query.OrderByDescending(budget => budget.CreatedOn).ThenByDescending(budget => budget.Id)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            .Select(budget => new WorkforceBudgetListItemResponse(
                budget.Id,
                budget.BudgetCode,
                budget.WorkforcePlanId,
                budget.FiscalYearId,
                budget.RevisionNumber,
                budget.CurrencyCode,
                budget.Status,
                budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AuthorizedHeadcount),
                budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedSalaryBudget),
                budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedRecruitmentBudget),
                budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedSalaryBudget + line.AllocatedRecruitmentBudget),
                budget.Status == WorkforceBudgetStatus.Approved && budget.ActivatedOn.HasValue && !budget.SupersededOn.HasValue,
                budget.ActivatedOn,
                budget.CreatedOn,
                budget.UpdatedOn,
                Convert.ToBase64String(budget.RowVersion)))
            .ToListAsync(cancellationToken);
        var page = new PagedList<WorkforceBudgetListItemResponse>(items, total, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<WorkforceBudgetListItemResponse>(page, page.MetaData);
    }

    public async Task<WorkforceBudgetDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var budget = await context.WorkforceBudgets.AsNoTracking()
            .Include(item => item.Lines)
            .ThenInclude(line => line.PeriodAllocations)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        return budget is null ? null : ToDetail(budget);
    }

    public async Task<PageResponse<BudgetSourcePlanResponse>> GetSourcePlansAsync(GetBudgetSourcePlansQuery request, CancellationToken cancellationToken)
    {
        var budgetedPlanIds = context.WorkforceBudgets.AsNoTracking()
            .Where(budget => !budget.IsDeleted)
            .Select(budget => budget.WorkforcePlanId);
        var query = context.WorkforcePlans.AsNoTracking()
            .Where(plan => !plan.IsDeleted && plan.Status == WorkforcePlanStatus.Approved && !budgetedPlanIds.Contains(plan.Id));
        if (request.FiscalYearId.HasValue) query = query.Where(plan => plan.FiscalYearId == request.FiscalYearId.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToUpper();
            query = query.Where(plan => plan.PlanCode.ToUpper().Contains(search) || plan.TitleEn.ToUpper().Contains(search) || plan.TitleAr.Contains(request.Search.Trim()));
        }

        var total = await query.CountAsync(cancellationToken);
        var plans = await query.OrderByDescending(plan => plan.CreatedOn).ThenByDescending(plan => plan.Id)
            .Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            .Include(plan => plan.Lines)
            .ThenInclude(line => line.PeriodTargets)
            .ToListAsync(cancellationToken);
        var yearIds = plans.Select(plan => plan.FiscalYearId).Distinct().ToArray();
        var periods = await context.FiscalYears.AsNoTracking()
            .Where(year => yearIds.Contains(year.Id))
            .SelectMany(year => year.Periods.Where(period => !period.IsDeleted).Select(period => new { YearId = year.Id, PeriodId = period.Id }))
            .ToListAsync(cancellationToken);
        var items = plans.Select(plan => ToSourcePlan(plan, periods.Where(period => period.YearId == plan.FiscalYearId).Select(period => period.PeriodId).ToArray())).ToList();
        var page = new PagedList<BudgetSourcePlanResponse>(items, total, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<BudgetSourcePlanResponse>(page, page.MetaData);
    }

    public async Task<BudgetSourcePlanResponse?> GetSourcePlanByIdAsync(int planId, CancellationToken cancellationToken)
    {
        var plan = await context.WorkforcePlans.AsNoTracking()
            .Include(item => item.Lines)
            .ThenInclude(line => line.PeriodTargets)
            .FirstOrDefaultAsync(item => item.Id == planId && !item.IsDeleted && item.Status == WorkforcePlanStatus.Approved, cancellationToken);
        if (plan is null) return null;
        var periodIds = await context.FiscalYears.AsNoTracking()
            .Where(year => year.Id == plan.FiscalYearId)
            .SelectMany(year => year.Periods.Where(period => !period.IsDeleted).Select(period => period.Id))
            .ToArrayAsync(cancellationToken);
        return ToSourcePlan(plan, periodIds);
    }

    public async Task<PageResponse<PositionEnvelopeListItemResponse>> GetEnvelopesAsync(GetPositionEnvelopesQuery request, CancellationToken cancellationToken)
    {
        var query = context.PositionEnvelopes.AsNoTracking().Where(envelope => !envelope.IsDeleted);
        if (request.FiscalYearId.HasValue) query = query.Where(envelope => envelope.FiscalYearId == request.FiscalYearId.Value);
        if (request.WorkforceBudgetId.HasValue) query = query.Where(envelope => envelope.WorkforceBudgetId == request.WorkforceBudgetId.Value);
        if (request.WorkforcePlanId.HasValue) query = query.Where(envelope => envelope.WorkforcePlanId == request.WorkforcePlanId.Value);
        if (request.BranchId.HasValue) query = query.Where(envelope => envelope.BranchId == request.BranchId.Value);
        if (request.DepartmentId.HasValue) query = query.Where(envelope => envelope.DepartmentId == request.DepartmentId.Value);
        if (request.PositionId.HasValue) query = query.Where(envelope => envelope.PositionId == request.PositionId.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToUpper();
            query = query.Where(envelope => envelope.EnvelopeCode.ToUpper().Contains(search));
        }

        query = (request.SortBy.ToUpperInvariant(), request.SortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase)) switch
        {
            ("ENVELOPECODE", true) => query.OrderBy(envelope => envelope.EnvelopeCode).ThenBy(envelope => envelope.Id),
            ("ENVELOPECODE", false) => query.OrderByDescending(envelope => envelope.EnvelopeCode).ThenByDescending(envelope => envelope.Id),
            ("CREATEDON", true) => query.OrderBy(envelope => envelope.CreatedOn).ThenBy(envelope => envelope.Id),
            _ => query.OrderByDescending(envelope => envelope.CreatedOn).ThenByDescending(envelope => envelope.Id)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            .Select(envelope => new PositionEnvelopeListItemResponse(
                envelope.Id,
                envelope.EnvelopeCode,
                envelope.WorkforceBudgetId,
                envelope.FiscalYearId,
                envelope.PositionId,
                envelope.BranchId,
                envelope.DepartmentId,
                envelope.DivisionId,
                envelope.CurrencyCode,
                envelope.AuthorizedHeadcount,
                envelope.ReservedHeadcount,
                envelope.HiredHeadcount,
                envelope.AuthorizedHeadcount - envelope.ReservedHeadcount - envelope.HiredHeadcount,
                envelope.AuthorizedSalaryBudget,
                envelope.ReservedSalaryBudget,
                envelope.ContractedSalaryBudget,
                envelope.AuthorizedSalaryBudget - envelope.ReservedSalaryBudget - envelope.ContractedSalaryBudget,
                envelope.CreatedOn,
                Convert.ToBase64String(envelope.RowVersion)))
            .ToListAsync(cancellationToken);
        var page = new PagedList<PositionEnvelopeListItemResponse>(items, total, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<PositionEnvelopeListItemResponse>(page, page.MetaData);
    }

    public async Task<PositionEnvelopeDetailResponse?> GetEnvelopeByIdAsync(int id, CancellationToken cancellationToken)
    {
        var envelope = await context.PositionEnvelopes.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        return envelope is null ? null : new PositionEnvelopeDetailResponse(
            envelope.Id,
            envelope.EnvelopeCode,
            envelope.WorkforceBudgetId,
            envelope.WorkforceBudgetLineId,
            envelope.WorkforcePlanId,
            envelope.WorkforcePlanLineId,
            envelope.FiscalYearId,
            envelope.PositionId,
            envelope.BranchId,
            envelope.DepartmentId,
            envelope.DivisionId,
            envelope.CurrencyCode,
            envelope.CalculationPolicyVersion,
            envelope.AuthorizedHeadcount,
            envelope.ReservedHeadcount,
            envelope.HiredHeadcount,
            envelope.AuthorizedHeadcount - envelope.ReservedHeadcount - envelope.HiredHeadcount,
            envelope.AuthorizedSalaryBudget,
            envelope.ReservedSalaryBudget,
            envelope.ContractedSalaryBudget,
            envelope.AuthorizedSalaryBudget - envelope.ReservedSalaryBudget - envelope.ContractedSalaryBudget,
            envelope.CreatedOn,
            envelope.UpdatedOn,
            Convert.ToBase64String(envelope.RowVersion));
    }

    private static WorkforceBudgetDetailResponse ToDetail(WorkforceBudget budget) =>
        new(
            budget.Id,
            budget.BudgetCode,
            budget.WorkforcePlanId,
            budget.FiscalYearId,
            budget.RevisionNumber,
            budget.CurrencyCode,
            budget.CalculationPolicyVersion,
            budget.Status,
            budget.SubmittedOn,
            budget.SubmittedById,
            budget.ApprovedOn,
            budget.ApprovedById,
            budget.RejectedOn,
            budget.RejectedById,
            budget.DecisionReason,
            budget.ActivatedOn,
            budget.SupersededOn,
            budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AuthorizedHeadcount),
            budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedSalaryBudget),
            budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedRecruitmentBudget),
            budget.Lines.Where(line => !line.IsDeleted).Sum(line => line.AllocatedSalaryBudget + line.AllocatedRecruitmentBudget),
            budget.Status == WorkforceBudgetStatus.Approved && budget.ActivatedOn.HasValue && !budget.SupersededOn.HasValue,
            budget.Lines.Where(line => !line.IsDeleted).Select(line => new WorkforceBudgetLineResponse(
                line.Id,
                line.WorkforcePlanLineId,
                line.PositionId,
                line.BranchId,
                line.DepartmentId,
                line.DivisionId,
                line.AuthorizedHeadcount,
                line.AllocatedSalaryBudget,
                line.AllocatedRecruitmentBudget,
                line.AllocatedSalaryBudget + line.AllocatedRecruitmentBudget,
                line.PeriodAllocations.Where(allocation => !allocation.IsDeleted).Select(allocation => new WorkforceBudgetPeriodAllocationResponse(
                    allocation.Id,
                    allocation.FiscalPeriodId,
                    allocation.TargetHeadcount,
                    allocation.AllocatedSalaryCost,
                    allocation.AllocatedRecruitmentCost)).ToArray())).ToArray(),
            budget.CreatedOn,
            budget.UpdatedOn,
            Convert.ToBase64String(budget.RowVersion));

    private static BudgetSourcePlanResponse ToSourcePlan(WorkforcePlan plan, IReadOnlyList<int> fiscalPeriodIds) =>
        new(
            plan.Id,
            plan.PlanCode,
            plan.FiscalYearId,
            plan.RevisionNumber,
            plan.TitleEn,
            plan.TitleAr,
            fiscalPeriodIds,
            plan.Lines.Where(line => !line.IsDeleted).Select(line => new BudgetSourcePlanLineResponse(
                line.Id,
                line.PositionId,
                line.TargetBranchId,
                line.DepartmentId,
                line.DivisionId,
                line.BaselineHeadcount,
                line.NewHireSlots,
                line.ReplacementSlots,
                line.NewHireSlots + line.ReplacementSlots,
                line.Justification,
                line.PeriodTargets.Where(target => !target.IsDeleted).Select(target => new BudgetSourcePlanPeriodResponse(
                    target.FiscalPeriodId,
                    target.NewHireSlots,
                    target.ReplacementSlots)).ToArray())).ToArray());
}

public sealed class WorkforceBudgetWriteStore(ApplicationDbContext context) : IWorkforceBudgetWriteStore
{
    public void Add(WorkforceBudget budget) => context.WorkforceBudgets.Add(budget);

    public void AddEnvelope(PositionEnvelope envelope) => context.PositionEnvelopes.Add(envelope);

    public Task<WorkforceBudget?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.WorkforceBudgets.Include(budget => budget.Lines).ThenInclude(line => line.PeriodAllocations)
            .FirstOrDefaultAsync(budget => budget.Id == id, cancellationToken);

    public Task<bool> CodeExistsAsync(string budgetCode, int fiscalYearId, int? excludedId, CancellationToken cancellationToken) =>
        context.WorkforceBudgets.AnyAsync(budget => budget.FiscalYearId == fiscalYearId && budget.BudgetCode == budgetCode && (!excludedId.HasValue || budget.Id != excludedId.Value), cancellationToken);

    public Task<bool> BudgetExistsForPlanAsync(int workforcePlanId, int? excludedId, CancellationToken cancellationToken) =>
        context.WorkforceBudgets.AnyAsync(budget => budget.WorkforcePlanId == workforcePlanId && !budget.IsDeleted && (!excludedId.HasValue || budget.Id != excludedId.Value), cancellationToken);

    public async Task<BudgetPlanSnapshot?> GetPlanAsync(int workforcePlanId, CancellationToken cancellationToken)
    {
        var plan = await context.WorkforcePlans.AsNoTracking()
            .Include(item => item.Lines)
            .ThenInclude(line => line.PeriodTargets)
            .FirstOrDefaultAsync(item => item.Id == workforcePlanId && !item.IsDeleted, cancellationToken);
        return plan is null
            ? null
            : new BudgetPlanSnapshot(
                plan.Id,
                plan.FiscalYearId,
                plan.RevisionNumber,
                plan.Status.ToString(),
                plan.Lines.Where(line => !line.IsDeleted).Select(line => new BudgetPlanLineSnapshot(
                    line.Id,
                    line.PositionId,
                    line.TargetBranchId,
                    line.DepartmentId,
                    line.DivisionId,
                    line.NewHireSlots,
                    line.ReplacementSlots,
                    line.NewHireSlots + line.ReplacementSlots,
                    line.PeriodTargets.Where(target => !target.IsDeleted).Select(target => new BudgetPlanLinePeriodSnapshot(
                        target.FiscalPeriodId,
                        target.NewHireSlots,
                        target.ReplacementSlots)).ToArray())).ToArray());
    }

    public async Task<FiscalYearPlanningSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken)
    {
        var result = await context.FiscalYears.AsNoTracking().Where(year => year.Id == fiscalYearId && !year.IsDeleted)
            .Select(year => new { year.Id, year.StartDate, year.EndDate, year.Status, PeriodIds = year.Periods.Where(period => !period.IsDeleted).Select(period => period.Id) })
            .FirstOrDefaultAsync(cancellationToken);
        return result is null ? null : new FiscalYearPlanningSnapshot(result.Id, result.StartDate, result.EndDate, result.PeriodIds.ToHashSet(), result.Status.ToString());
    }

    public Task<WorkforceBudget?> GetEffectiveBudgetAsync(int fiscalYearId, int? excludedId, CancellationToken cancellationToken) =>
        context.WorkforceBudgets
            .Where(budget => budget.FiscalYearId == fiscalYearId
                && budget.Status == WorkforceBudgetStatus.Approved
                && budget.ActivatedOn.HasValue
                && !budget.SupersededOn.HasValue
                && !budget.IsDeleted
                && (!excludedId.HasValue || budget.Id != excludedId.Value))
            .OrderByDescending(budget => budget.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<WorkforcePlan?> GetPlanForUpdateAsync(int planId, CancellationToken cancellationToken) =>
        context.WorkforcePlans.Include(plan => plan.Lines).ThenInclude(line => line.PeriodTargets)
            .FirstOrDefaultAsync(plan => plan.Id == planId, cancellationToken);

    public void RemovePeriodAllocations(IReadOnlyCollection<WorkforceBudgetPeriodAllocation> allocations) => context.WorkforceBudgetPeriodAllocations.RemoveRange(allocations);

    public void RemoveLines(IReadOnlyCollection<WorkforceBudgetLine> lines) => context.WorkforceBudgetLines.RemoveRange(lines);

    public void ApplyRowVersion(WorkforceBudget budget, string rowVersion) =>
        context.Entry(budget).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(rowVersion);
}
