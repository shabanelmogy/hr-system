using FluentValidation;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Abstractions.Persistence;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;
using ErpSystem.Modules.HR.Domain.Common.Exceptions;
using ErpSystem.Modules.HR.Domain.Finance.FiscalYears.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;

public sealed record CreateWorkforceBudgetCommand(CreateWorkforceBudgetRequest Request)
    : ICommand<Result<WorkforceBudgetDetailResponse>>;

public sealed record UpdateWorkforceBudgetCommand(int Id, UpdateWorkforceBudgetRequest Request)
    : ICommand<Result<WorkforceBudgetDetailResponse>>;

public sealed record SubmitWorkforceBudgetCommand(int Id, string RowVersion) : ICommand<Result<WorkforceBudgetDetailResponse>>;
public sealed record ApproveWorkforceBudgetCommand(int Id, string RowVersion) : ICommand<Result<WorkforceBudgetDetailResponse>>;
public sealed record RejectWorkforceBudgetCommand(int Id, string Reason, string RowVersion) : ICommand<Result<WorkforceBudgetDetailResponse>>;

internal static class WorkforceBudgetCommandValidation
{
    public static bool IsRowVersion(string value)
    {
        try { return Convert.FromBase64String(value).Length > 0; }
        catch (FormatException) { return false; }
    }
}

public sealed class WorkforceBudgetPeriodAllocationRequestValidator : AbstractValidator<WorkforceBudgetPeriodAllocationRequest>
{
    public WorkforceBudgetPeriodAllocationRequestValidator()
    {
        RuleFor(allocation => allocation.FiscalPeriodId).GreaterThan(0);
        RuleFor(allocation => allocation.TargetHeadcount).GreaterThanOrEqualTo(0);
        RuleFor(allocation => allocation.AllocatedSalaryCost).GreaterThanOrEqualTo(0);
        RuleFor(allocation => allocation.AllocatedRecruitmentCost).GreaterThanOrEqualTo(0);
    }
}

public sealed class WorkforceBudgetLineRequestValidator : AbstractValidator<WorkforceBudgetLineRequest>
{
    public WorkforceBudgetLineRequestValidator()
    {
        RuleFor(line => line.WorkforcePlanLineId).GreaterThan(0);
        RuleFor(line => line.AuthorizedHeadcount).GreaterThanOrEqualTo(0);
        RuleFor(line => line.AllocatedSalaryBudget).GreaterThanOrEqualTo(0);
        RuleFor(line => line.AllocatedRecruitmentBudget).GreaterThanOrEqualTo(0);
        RuleFor(line => line.PeriodAllocations).NotEmpty().Must(items => items.Count <= 100);
        RuleFor(line => line.PeriodAllocations).Must(items => items.Select(item => item.FiscalPeriodId).Distinct().Count() == items.Count)
            .WithMessage("Each fiscal period may appear once per budget line.");
        RuleFor(line => line.PeriodAllocations.Sum(allocation => allocation.TargetHeadcount))
            .Equal(line => line.AuthorizedHeadcount)
            .WithMessage("Period headcount allocations must equal the line's authorized headcount.");
        RuleFor(line => line.PeriodAllocations.Sum(allocation => allocation.AllocatedSalaryCost))
            .Equal(line => line.AllocatedSalaryBudget)
            .WithMessage("Period salary allocations must equal the line's allocated salary budget.");
        RuleFor(line => line.PeriodAllocations.Sum(allocation => allocation.AllocatedRecruitmentCost))
            .Equal(line => line.AllocatedRecruitmentBudget)
            .WithMessage("Period recruitment allocations must equal the line's allocated recruitment budget.");
        RuleForEach(line => line.PeriodAllocations).SetValidator(new WorkforceBudgetPeriodAllocationRequestValidator());
    }
}

public sealed class CreateWorkforceBudgetCommandValidator : AbstractValidator<CreateWorkforceBudgetCommand>
{
    public CreateWorkforceBudgetCommandValidator()
    {
        RuleFor(command => command.Request.BudgetCode).NotEmpty().MaximumLength(50);
        RuleFor(command => command.Request.WorkforcePlanId).GreaterThan(0);
        RuleFor(command => command.Request.CurrencyCode).NotEmpty().Length(3);
        RuleFor(command => command.Request.Lines).NotEmpty().Must(lines => lines.Count <= 500);
        RuleForEach(command => command.Request.Lines).SetValidator(new WorkforceBudgetLineRequestValidator());
    }
}

public sealed class UpdateWorkforceBudgetCommandValidator : AbstractValidator<UpdateWorkforceBudgetCommand>
{
    public UpdateWorkforceBudgetCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.Request.CurrencyCode).NotEmpty().Length(3);
        RuleFor(command => command.Request.RowVersion)
            .NotEmpty()
            .Must(WorkforceBudgetCommandValidation.IsRowVersion)
            .WithMessage("A valid row version is required.");
        RuleFor(command => command.Request.Lines).NotEmpty().Must(lines => lines.Count <= 500);
        RuleForEach(command => command.Request.Lines).SetValidator(new WorkforceBudgetLineRequestValidator());
    }
}

public sealed class SubmitWorkforceBudgetCommandValidator : AbstractValidator<SubmitWorkforceBudgetCommand>
{
    public SubmitWorkforceBudgetCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforceBudgetCommandValidation.IsRowVersion);
    }
}

public sealed class ApproveWorkforceBudgetCommandValidator : AbstractValidator<ApproveWorkforceBudgetCommand>
{
    public ApproveWorkforceBudgetCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforceBudgetCommandValidation.IsRowVersion);
    }
}

public sealed class RejectWorkforceBudgetCommandValidator : AbstractValidator<RejectWorkforceBudgetCommand>
{
    public RejectWorkforceBudgetCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.Reason).NotEmpty().MaximumLength(2000);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforceBudgetCommandValidation.IsRowVersion);
    }
}

public sealed class CreateWorkforceBudgetCommandHandler(
    IWorkforceBudgetWriteStore writeStore,
    IWorkforceBudgetReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    WorkforceBudgetEffects effects,
    WorkforceBudgetErrors errors)
    : ICommandHandler<CreateWorkforceBudgetCommand, Result<WorkforceBudgetDetailResponse>>
{
    public async Task<Result<WorkforceBudgetDetailResponse>> Handle(CreateWorkforceBudgetCommand command, CancellationToken cancellationToken)
    {
        if (!BudgetScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforceBudgetDetailResponse>(errors.CompanyContextRequired);

        var request = command.Request;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var plan = await writeStore.GetPlanAsync(request.WorkforcePlanId, token);
                if (plan is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.PlanNotFound);
                if (!string.Equals(plan.Status, nameof(WorkforcePlanStatus.Approved), StringComparison.Ordinal))
                    return Result.Failure<WorkforceBudgetDetailResponse>(errors.PlanNotApproved);
                var fiscalYear = await writeStore.GetFiscalYearAsync(plan.FiscalYearId, token);
                if (fiscalYear is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearNotFound);
                if (fiscalYear.Status is not (nameof(FiscalYearStatus.Draft) or nameof(FiscalYearStatus.Open)))
                    return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearNotEditable);

                var code = request.BudgetCode.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, plan.FiscalYearId, null, token))
                    return Result.Failure<WorkforceBudgetDetailResponse>(errors.DuplicateCode);
                if (await writeStore.BudgetExistsForPlanAsync(plan.Id, null, token))
                    return Result.Failure<WorkforceBudgetDetailResponse>(errors.DuplicatePlan);

                var budget = new WorkforceBudget(code, plan.Id, plan.FiscalYearId, plan.RevisionNumber, request.CurrencyCode);
                budget.TenantId = tenantId;
                budget.CompanyId = companyId;
                var buildFailure = WorkforceBudgetCommandSupport.ApplyLines(budget, request.Lines, plan, fiscalYear, errors);
                if (buildFailure is not null) return Result.Failure<WorkforceBudgetDetailResponse>(buildFailure);
                writeStore.Add(budget);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await readStore.GetByIdAsync(budget.Id, token))!);
            }, cancellationToken);

        if (result.IsSuccess) effects.BudgetChanged(result.Value.Id, "Add");
        return result;
    }
}

public sealed class UpdateWorkforceBudgetCommandHandler(
    IWorkforceBudgetWriteStore writeStore,
    IWorkforceBudgetReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    WorkforceBudgetEffects effects,
    WorkforceBudgetErrors errors)
    : ICommandHandler<UpdateWorkforceBudgetCommand, Result<WorkforceBudgetDetailResponse>>
{
    public async Task<Result<WorkforceBudgetDetailResponse>> Handle(UpdateWorkforceBudgetCommand command, CancellationToken cancellationToken)
    {
        if (!BudgetScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforceBudgetDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var budget = await writeStore.GetForUpdateAsync(command.Id, token);
                if (budget is null || budget.IsDeleted) return Result.Failure<WorkforceBudgetDetailResponse>(errors.NotFound);
                var plan = await writeStore.GetPlanAsync(budget.WorkforcePlanId, token);
                if (plan is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.PlanNotFound);
                var fiscalYear = await writeStore.GetFiscalYearAsync(budget.FiscalYearId, token);
                if (fiscalYear is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearNotFound);
                if (fiscalYear.Status is not (nameof(FiscalYearStatus.Draft) or nameof(FiscalYearStatus.Open)))
                    return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearNotEditable);
                writeStore.ApplyRowVersion(budget, command.Request.RowVersion);
                try { budget.UpdateDraft(command.Request.CurrencyCode); }
                catch (DomainRuleException) { return Result.Failure<WorkforceBudgetDetailResponse>(errors.InvalidTransition); }
                writeStore.RemovePeriodAllocations(budget.Lines.SelectMany(line => line.PeriodAllocations).ToArray());
                writeStore.RemoveLines(budget.Lines.ToArray());
                budget.RemoveDraftLines();
                var buildFailure = WorkforceBudgetCommandSupport.ApplyLines(budget, command.Request.Lines, plan, fiscalYear, errors);
                if (buildFailure is not null) return Result.Failure<WorkforceBudgetDetailResponse>(buildFailure);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await readStore.GetByIdAsync(budget.Id, token))!);
            }, cancellationToken);

        if (result.IsSuccess) effects.BudgetChanged(result.Value.Id, "Update");
        return result;
    }
}

public sealed class SubmitWorkforceBudgetCommandHandler(IWorkforceBudgetWriteStore store, IWorkforceBudgetReadStore reads, IUnitOfWork uow, ICurrentActor actor, TimeProvider clock, WorkforceBudgetEffects effects, WorkforceBudgetErrors errors)
    : ICommandHandler<SubmitWorkforceBudgetCommand, Result<WorkforceBudgetDetailResponse>>
{
    public async Task<Result<WorkforceBudgetDetailResponse>> Handle(SubmitWorkforceBudgetCommand command, CancellationToken cancellationToken)
    {
        if (!BudgetScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforceBudgetDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var budget = await store.GetForUpdateAsync(command.Id, token);
            if (budget is null || budget.IsDeleted) return Result.Failure<WorkforceBudgetDetailResponse>(errors.NotFound);
            var fiscalYear = await store.GetFiscalYearAsync(budget.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearNotFound);
            if (!string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal))
                return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearMustBeOpen);
            store.ApplyRowVersion(budget, command.RowVersion);
            try { budget.Submit(clock.GetUtcNow(), actor.UserId ?? string.Empty); }
            catch (DomainRuleException) { return Result.Failure<WorkforceBudgetDetailResponse>(errors.InvalidTransition); }
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(budget.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.BudgetChanged(result.Value.Id, "Submit");
        return result;
    }
}

public sealed class ApproveWorkforceBudgetCommandHandler(IWorkforceBudgetWriteStore store, IWorkforceBudgetReadStore reads, IUnitOfWork uow, ICurrentActor actor, TimeProvider clock, WorkforceBudgetEffects effects, WorkforceBudgetErrors errors)
    : ICommandHandler<ApproveWorkforceBudgetCommand, Result<WorkforceBudgetDetailResponse>>
{
    public async Task<Result<WorkforceBudgetDetailResponse>> Handle(ApproveWorkforceBudgetCommand command, CancellationToken cancellationToken)
    {
        if (!BudgetScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforceBudgetDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var budget = await store.GetForUpdateAsync(command.Id, token);
            if (budget is null || budget.IsDeleted) return Result.Failure<WorkforceBudgetDetailResponse>(errors.NotFound);
            var fiscalYear = await store.GetFiscalYearAsync(budget.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearNotFound);
            var planSnapshot = await store.GetPlanAsync(budget.WorkforcePlanId, token);
            if (planSnapshot is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.PlanNotFound);
            if (!string.Equals(planSnapshot.Status, nameof(WorkforcePlanStatus.Approved), StringComparison.Ordinal))
                return Result.Failure<WorkforceBudgetDetailResponse>(errors.PlanNotApproved);
            store.ApplyRowVersion(budget, command.RowVersion);
            var revalidation = WorkforceBudgetCommandSupport.Revalidate(budget, planSnapshot, fiscalYear, errors);
            if (revalidation is not null) return Result.Failure<WorkforceBudgetDetailResponse>(revalidation);
            var now = clock.GetUtcNow();
            try { budget.Approve(now, actor.UserId ?? string.Empty, string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal)); }
            catch (DomainRuleException exception) when (exception.Code == "WorkforceBudget.FiscalYearMustBeOpen") { return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearMustBeOpen); }
            catch (DomainRuleException) { return Result.Failure<WorkforceBudgetDetailResponse>(errors.InvalidTransition); }
            budget.Activate(now);
            var plan = await store.GetPlanForUpdateAsync(budget.WorkforcePlanId, token);
            if (plan is null || plan.IsDeleted) return Result.Failure<WorkforceBudgetDetailResponse>(errors.PlanNotFound);
            plan.Activate(now);
            var previousBudget = await store.GetEffectiveBudgetAsync(budget.FiscalYearId, budget.Id, token);
            if (previousBudget is not null)
            {
                previousBudget.Supersede(now);
                if (previousBudget.WorkforcePlanId != budget.WorkforcePlanId)
                {
                    var previousPlan = await store.GetPlanForUpdateAsync(previousBudget.WorkforcePlanId, token);
                    previousPlan?.Supersede(now);
                }
            }
            foreach (var line in budget.Lines)
            {
                var envelope = PositionEnvelope.FromBudgetLine(budget, line);
                envelope.TenantId = tenantId;
                envelope.CompanyId = companyId;
                store.AddEnvelope(envelope);
            }
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(budget.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.ApprovalActivated(result.Value.Id);
        return result;
    }
}

public sealed class RejectWorkforceBudgetCommandHandler(IWorkforceBudgetWriteStore store, IWorkforceBudgetReadStore reads, IUnitOfWork uow, ICurrentActor actor, TimeProvider clock, WorkforceBudgetEffects effects, WorkforceBudgetErrors errors)
    : ICommandHandler<RejectWorkforceBudgetCommand, Result<WorkforceBudgetDetailResponse>>
{
    public async Task<Result<WorkforceBudgetDetailResponse>> Handle(RejectWorkforceBudgetCommand command, CancellationToken cancellationToken)
    {
        if (!BudgetScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforceBudgetDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var budget = await store.GetForUpdateAsync(command.Id, token);
            if (budget is null || budget.IsDeleted) return Result.Failure<WorkforceBudgetDetailResponse>(errors.NotFound);
            var fiscalYear = await store.GetFiscalYearAsync(budget.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearNotFound);
            if (!string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal))
                return Result.Failure<WorkforceBudgetDetailResponse>(errors.FiscalYearMustBeOpen);
            store.ApplyRowVersion(budget, command.RowVersion);
            try { budget.Reject(clock.GetUtcNow(), actor.UserId ?? string.Empty, command.Reason); }
            catch (DomainRuleException) { return Result.Failure<WorkforceBudgetDetailResponse>(errors.InvalidTransition); }
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(budget.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.BudgetChanged(result.Value.Id, "Reject");
        return result;
    }
}

internal static class BudgetScope
{
    public static bool TryGet(ICurrentActor currentActor, out string tenantId, out int companyId)
    {
        tenantId = currentActor.TenantId ?? string.Empty;
        companyId = currentActor.CompanyId.GetValueOrDefault();
        return tenantId.Length > 0 && companyId > 0;
    }
}

internal static class WorkforceBudgetCommandSupport
{
    public static Error? ApplyLines(
        WorkforceBudget budget,
        IReadOnlyList<WorkforceBudgetLineRequest> requests,
        BudgetPlanSnapshot plan,
        FiscalYearPlanningSnapshot fiscalYear,
        WorkforceBudgetErrors errors)
    {
        if (requests.Count != plan.Lines.Count) return errors.IncompleteLines;
        var planLines = plan.Lines.ToDictionary(line => line.Id);
        var seen = new HashSet<int>();
        foreach (var request in requests)
        {
            if (!seen.Add(request.WorkforcePlanLineId)) return errors.DuplicateLine;
            if (!planLines.TryGetValue(request.WorkforcePlanLineId, out var planLine)) return errors.ForeignLine;
            if (request.AuthorizedHeadcount > planLine.PlannedHiringSlots) return errors.HeadcountCeiling;
            var periodCeilings = planLine.PeriodTargets.ToDictionary(target => target.FiscalPeriodId, target => target.NewHireSlots + target.ReplacementSlots);
            var seenPeriods = new HashSet<int>();
            foreach (var allocation in request.PeriodAllocations)
            {
                if (!seenPeriods.Add(allocation.FiscalPeriodId)) return errors.DuplicatePeriod;
                if (!fiscalYear.PeriodIds.Contains(allocation.FiscalPeriodId)) return errors.PeriodNotFound;
                if (!periodCeilings.TryGetValue(allocation.FiscalPeriodId, out var ceiling) || allocation.TargetHeadcount > ceiling)
                    return errors.PeriodHeadcountCeiling;
            }
            var line = budget.AddLine(
                planLine.Id,
                planLine.PositionId,
                planLine.TargetBranchId,
                planLine.DepartmentId,
                planLine.DivisionId,
                request.AuthorizedHeadcount,
                request.AllocatedSalaryBudget,
                request.AllocatedRecruitmentBudget);
            foreach (var allocation in request.PeriodAllocations)
            {
                try { line.AddPeriodAllocation(allocation.FiscalPeriodId, allocation.TargetHeadcount, allocation.AllocatedSalaryCost, allocation.AllocatedRecruitmentCost); }
                catch (DomainRuleException) { return errors.DuplicatePeriod; }
            }
            try { line.ValidateAllocations(); }
            catch (DomainRuleException exception) { return MapAllocationError(exception, errors); }
        }
        var missing = planLines.Keys.Except(seen);
        return missing.Any() ? errors.IncompleteLines : null;
    }

    public static Error? Revalidate(
        WorkforceBudget budget,
        BudgetPlanSnapshot plan,
        FiscalYearPlanningSnapshot fiscalYear,
        WorkforceBudgetErrors errors)
    {
        if (budget.FiscalYearId != plan.FiscalYearId) return errors.PlanNotApproved;
        var planLines = plan.Lines.ToDictionary(line => line.Id);
        if (budget.Lines.Count != planLines.Count) return errors.IncompleteLines;
        foreach (var line in budget.Lines)
        {
            if (!planLines.TryGetValue(line.WorkforcePlanLineId, out var planLine)) return errors.ForeignLine;
            if (line.AuthorizedHeadcount > planLine.PlannedHiringSlots) return errors.HeadcountCeiling;
            var periodCeilings = planLine.PeriodTargets.ToDictionary(target => target.FiscalPeriodId, target => target.NewHireSlots + target.ReplacementSlots);
            var seenPeriods = new HashSet<int>();
            foreach (var allocation in line.PeriodAllocations)
            {
                if (!seenPeriods.Add(allocation.FiscalPeriodId)) return errors.DuplicatePeriod;
                if (!fiscalYear.PeriodIds.Contains(allocation.FiscalPeriodId)) return errors.PeriodNotFound;
                if (!periodCeilings.TryGetValue(allocation.FiscalPeriodId, out var ceiling) || allocation.TargetHeadcount > ceiling)
                    return errors.PeriodHeadcountCeiling;
            }
            try { line.ValidateAllocations(); }
            catch (DomainRuleException exception) { return MapAllocationError(exception, errors); }
        }
        return null;
    }

    private static Error MapAllocationError(DomainRuleException exception, WorkforceBudgetErrors errors) =>
        exception.Code switch
        {
            "WorkforceBudget.HeadcountMismatch" => errors.HeadcountMismatch,
            "WorkforceBudget.SalaryMismatch" => errors.SalaryMismatch,
            "WorkforceBudget.RecruitmentMismatch" => errors.RecruitmentMismatch,
            _ => errors.InvalidTransition
        };
}
