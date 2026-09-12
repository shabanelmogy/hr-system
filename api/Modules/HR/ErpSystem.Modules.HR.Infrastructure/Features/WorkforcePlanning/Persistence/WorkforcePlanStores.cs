using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Queries;
using ErpSystem.Modules.HR.Domain.Finance.FiscalYears.Enums;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;

public sealed class WorkforcePlanReadStore(ApplicationDbContext context) : IWorkforcePlanReadStore
{
    public async Task<PageResponse<WorkforcePlanListItemResponse>> GetPageAsync(GetWorkforcePlansQuery request, CancellationToken cancellationToken)
    {
        var query = context.WorkforcePlans.AsNoTracking();
        query = request.RecordStatus.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(plan => plan.IsDeleted),
            "ALL" => query,
            _ => query.Where(plan => !plan.IsDeleted)
        };
        if (request.FiscalYearId.HasValue) query = query.Where(plan => plan.FiscalYearId == request.FiscalYearId.Value);
        if (!request.Status.Equals("all", StringComparison.OrdinalIgnoreCase) && Enum.TryParse<WorkforcePlanStatus>(request.Status, true, out var status))
            query = query.Where(plan => plan.Status == status);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToUpper();
            query = query.Where(plan => plan.PlanCode.ToUpper().Contains(search) || plan.TitleEn.ToUpper().Contains(search) || plan.TitleAr.Contains(request.Search.Trim()));
        }

        query = (request.SortBy.ToUpperInvariant(), request.SortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase)) switch
        {
            ("PLANCODE", true) => query.OrderBy(plan => plan.PlanCode).ThenBy(plan => plan.Id),
            ("PLANCODE", false) => query.OrderByDescending(plan => plan.PlanCode).ThenByDescending(plan => plan.Id),
            ("TITLEEN", true) => query.OrderBy(plan => plan.TitleEn).ThenBy(plan => plan.Id),
            ("TITLEEN", false) => query.OrderByDescending(plan => plan.TitleEn).ThenByDescending(plan => plan.Id),
            ("TITLEAR", true) => query.OrderBy(plan => plan.TitleAr).ThenBy(plan => plan.Id),
            ("TITLEAR", false) => query.OrderByDescending(plan => plan.TitleAr).ThenByDescending(plan => plan.Id),
            ("STATUS", true) => query.OrderBy(plan => plan.Status).ThenBy(plan => plan.Id),
            ("STATUS", false) => query.OrderByDescending(plan => plan.Status).ThenByDescending(plan => plan.Id),
            ("CREATEDON", true) => query.OrderBy(plan => plan.CreatedOn).ThenBy(plan => plan.Id),
            _ => query.OrderByDescending(plan => plan.CreatedOn).ThenByDescending(plan => plan.Id)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            .Select(plan => new WorkforcePlanListItemResponse(
                plan.Id,
                plan.PlanSeriesId,
                plan.PlanCode,
                plan.FiscalYearId,
                plan.RevisionNumber,
                plan.TitleEn,
                plan.TitleAr,
                plan.Status,
                plan.Lines.Count(line => !line.IsDeleted),
                plan.Lines.Where(line => !line.IsDeleted).Sum(line => line.NewHireSlots),
                plan.Lines.Where(line => !line.IsDeleted).Sum(line => line.ReplacementSlots),
                plan.Lines.Where(line => !line.IsDeleted).Sum(line => line.NewHireSlots + line.ReplacementSlots),
                plan.Status == WorkforcePlanStatus.Approved && plan.ActivatedOn.HasValue && !plan.SupersededOn.HasValue,
                plan.IsDeleted,
                plan.CreatedOn,
                plan.UpdatedOn,
                Convert.ToBase64String(plan.RowVersion)))
            .ToListAsync(cancellationToken);
        var page = new PagedList<WorkforcePlanListItemResponse>(items, total, request.PageNumber, request.PageSize);
        return new PageResponse<WorkforcePlanListItemResponse>(page, page.MetaData);
    }

    public async Task<WorkforcePlanDetailResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var plan = await context.WorkforcePlans.AsNoTracking()
            .Include(item => item.Lines)
            .ThenInclude(line => line.PeriodTargets)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        return plan is null ? null : ToDetail(plan);
    }

    public async Task<IReadOnlyList<WorkforcePlanDetailResponse>> GetRevisionsAsync(int id, CancellationToken cancellationToken)
    {
        var seriesId = await context.WorkforcePlans.AsNoTracking()
            .Where(plan => plan.Id == id)
            .Select(plan => (Guid?)plan.PlanSeriesId)
            .FirstOrDefaultAsync(cancellationToken);

        if (!seriesId.HasValue)
            return [];

        var revisions = await context.WorkforcePlans.AsNoTracking()
            .Include(plan => plan.Lines)
            .ThenInclude(line => line.PeriodTargets)
            .Where(plan => plan.PlanSeriesId == seriesId.Value)
            .OrderByDescending(plan => plan.RevisionNumber)
            .Take(50)
            .ToListAsync(cancellationToken);

        return revisions.Select(ToDetail).ToArray();
    }

    private static WorkforcePlanDetailResponse ToDetail(WorkforcePlan plan) =>
        new(
            plan.Id,
            plan.PlanSeriesId,
            plan.PlanCode,
            plan.FiscalYearId,
            plan.RevisionNumber,
            plan.PreviousRevisionId,
            plan.TitleEn,
            plan.TitleAr,
            plan.Description,
            plan.Status,
            plan.SubmittedOn,
            plan.SubmittedById,
            plan.ApprovedOn,
            plan.ApprovedById,
            plan.RejectedOn,
            plan.RejectedById,
            plan.DecisionReason,
            plan.ActivatedOn,
            plan.SupersededOn,
            plan.Lines.Where(line => !line.IsDeleted).Select(line => new WorkforcePlanLineResponse(
                line.Id,
                line.PositionId,
                line.TargetBranchId,
                line.DepartmentId,
                line.DivisionId,
                line.BaselineHeadcount,
                line.BaselineAsOfDate,
                line.NewHireSlots,
                line.ReplacementSlots,
                line.TargetHeadcount,
                line.PlannedHiringSlots,
                line.Justification,
                line.PeriodTargets.Where(target => !target.IsDeleted).Select(target => new WorkforcePlanPeriodTargetResponse(target.Id, target.FiscalPeriodId, target.NewHireSlots, target.ReplacementSlots)).ToArray())).ToArray(),
            plan.CreatedOn,
            plan.UpdatedOn,
            plan.IsDeleted,
            Convert.ToBase64String(plan.RowVersion));
}

public sealed class WorkforcePlanWriteStore(ApplicationDbContext context) : IWorkforcePlanWriteStore
{
    public void Add(WorkforcePlan plan) => context.WorkforcePlans.Add(plan);

    public Task<WorkforcePlan?> GetForUpdateAsync(int id, CancellationToken cancellationToken) =>
        context.WorkforcePlans.Include(plan => plan.Lines).ThenInclude(line => line.PeriodTargets)
            .FirstOrDefaultAsync(plan => plan.Id == id, cancellationToken);

    public Task<bool> CodeExistsAsync(string planCode, int fiscalYearId, int? excludedId, CancellationToken cancellationToken) =>
        context.WorkforcePlans.AnyAsync(plan => plan.FiscalYearId == fiscalYearId && plan.PlanCode == planCode && (!excludedId.HasValue || plan.Id != excludedId.Value), cancellationToken);

    public async Task<FiscalYearPlanningSnapshot?> GetFiscalYearAsync(int fiscalYearId, CancellationToken cancellationToken)
    {
        var result = await context.FiscalYears.AsNoTracking().Where(year => year.Id == fiscalYearId && !year.IsDeleted)
            .Select(year => new { year.Id, year.StartDate, year.EndDate, year.Status, PeriodIds = year.Periods.Where(period => !period.IsDeleted).Select(period => period.Id) })
            .FirstOrDefaultAsync(cancellationToken);
        return result is null ? null : new FiscalYearPlanningSnapshot(result.Id, result.StartDate, result.EndDate, result.PeriodIds.ToHashSet(), result.Status.ToString());
    }

    public Task<PositionPlanningSnapshot?> GetPositionAsync(int positionId, CancellationToken cancellationToken) =>
        context.Positions.AsNoTracking().Where(position => position.Id == positionId && !position.IsDeleted)
            .Select(position => new PositionPlanningSnapshot(position.Id, position.DivisionId, position.Division.DepartmentId, position.Division.Department.BranchId))
            .FirstOrDefaultAsync(cancellationToken);

    public Task<bool> IsBranchAvailableAsync(int branchId, CancellationToken cancellationToken) =>
        context.Branches.AsNoTracking().AnyAsync(branch => branch.Id == branchId && branch.IsActive && !branch.IsDeleted, cancellationToken);

    public Task<int> GetBaselineHeadcountAsync(int positionId, int? branchId, DateOnly asOfDate, CancellationToken cancellationToken)
    {
        var assignments = context.EmployeeAssignments.AsNoTracking()
            .Where(assignment =>
                assignment.PositionId == positionId &&
                assignment.IsPrimary &&
                !assignment.IsDeleted &&
                assignment.EffectiveFrom <= asOfDate &&
                (!assignment.EffectiveTo.HasValue || assignment.EffectiveTo.Value >= asOfDate));

        if (branchId.HasValue)
            assignments = assignments.Where(assignment => assignment.BranchId == branchId.Value);

        return assignments.Select(assignment => assignment.EmployeeId).Distinct().CountAsync(cancellationToken);
    }

    public void RemovePeriodTargets(IReadOnlyCollection<WorkforcePlanLinePeriodTarget> targets) => context.WorkforcePlanLinePeriodTargets.RemoveRange(targets);

    public void RemoveLines(IReadOnlyCollection<WorkforcePlanLine> lines) => context.WorkforcePlanLines.RemoveRange(lines);

    public void ApplyRowVersion(WorkforcePlan plan, string rowVersion)
    {
        var entry = context.Entry(plan);
        entry.Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(rowVersion);

        // WorkforcePlan is the concurrency boundary for the whole aggregate. A draft
        // update may replace only lines/period targets while leaving every scalar on
        // the parent unchanged. Force the parent into the UPDATE so SQL Server checks
        // the supplied rowversion and generates a fresh one for every aggregate edit.
        // ApplicationDbContext.PrepareChanges replaces this value with the real audit
        // timestamp immediately before SaveChanges.
        entry.Property(item => item.UpdatedOn).IsModified = true;
    }
}
