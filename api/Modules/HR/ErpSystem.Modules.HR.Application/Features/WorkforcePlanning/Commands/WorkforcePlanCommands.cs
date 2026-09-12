using FluentValidation;
using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Abstractions.Persistence;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;
using ErpSystem.Modules.HR.Domain.Common.Exceptions;
using ErpSystem.Modules.HR.Domain.Finance.FiscalYears.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;

public sealed record CreateWorkforcePlanCommand(CreateWorkforcePlanRequest Request)
    : ICommand<Result<WorkforcePlanDetailResponse>>;

public sealed record UpdateWorkforcePlanCommand(int Id, UpdateWorkforcePlanRequest Request)
    : ICommand<Result<WorkforcePlanDetailResponse>>;

public sealed record SubmitWorkforcePlanCommand(int Id, string RowVersion) : ICommand<Result<WorkforcePlanDetailResponse>>;
public sealed record BeginWorkforcePlanReviewCommand(int Id, string RowVersion) : ICommand<Result<WorkforcePlanDetailResponse>>;
public sealed record ApproveWorkforcePlanCommand(int Id, string RowVersion) : ICommand<Result<WorkforcePlanDetailResponse>>;
public sealed record RejectWorkforcePlanCommand(int Id, string Reason, string RowVersion) : ICommand<Result<WorkforcePlanDetailResponse>>;
public sealed record CreateWorkforcePlanRevisionCommand(int Id, string RowVersion) : ICommand<Result<WorkforcePlanDetailResponse>>;
public sealed record ArchiveWorkforcePlanCommand(int Id, string RowVersion) : ICommand<Result>;
public sealed record RestoreWorkforcePlanCommand(int Id, string RowVersion) : ICommand<Result<WorkforcePlanDetailResponse>>;

internal static class WorkforcePlanCommandValidation
{
    public static bool IsRowVersion(string value)
    {
        try { return Convert.FromBase64String(value).Length > 0; }
        catch (FormatException) { return false; }
    }
}

public sealed class CreateWorkforcePlanCommandValidator : AbstractValidator<CreateWorkforcePlanCommand>
{
    public CreateWorkforcePlanCommandValidator()
    {
        RuleFor(command => command.Request).SetValidator(new WorkforcePlanRequestValidator());
    }
}

public sealed class UpdateWorkforcePlanCommandValidator : AbstractValidator<UpdateWorkforcePlanCommand>
{
    public UpdateWorkforcePlanCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.Request.RowVersion)
            .NotEmpty()
            .Must(WorkforcePlanCommandValidation.IsRowVersion)
            .WithMessage("A valid row version is required.");
        RuleFor(command => command.Request.TitleEn).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Request.TitleAr).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Request.Lines).NotEmpty().Must(lines => lines.Count <= 500);
        RuleForEach(command => command.Request.Lines).SetValidator(new WorkforcePlanLineRequestValidator());
    }
}

public sealed class WorkforcePlanRequestValidator : AbstractValidator<CreateWorkforcePlanRequest>
{
    public WorkforcePlanRequestValidator()
    {
        RuleFor(request => request.PlanCode).NotEmpty().MaximumLength(50);
        RuleFor(request => request.FiscalYearId).GreaterThan(0);
        RuleFor(request => request.TitleEn).NotEmpty().MaximumLength(200);
        RuleFor(request => request.TitleAr).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Lines).NotEmpty().Must(lines => lines.Count <= 500);
        RuleForEach(request => request.Lines).SetValidator(new WorkforcePlanLineRequestValidator());
    }
}

public sealed class WorkforcePlanLineRequestValidator : AbstractValidator<WorkforcePlanLineRequest>
{
    public WorkforcePlanLineRequestValidator()
    {
        RuleFor(line => line.PositionId).GreaterThan(0);
        RuleFor(line => line.TargetBranchId).GreaterThan(0).When(line => line.TargetBranchId.HasValue);
        RuleFor(line => line.NewHireSlots).GreaterThanOrEqualTo(0);
        RuleFor(line => line.ReplacementSlots).GreaterThanOrEqualTo(0);
        RuleFor(line => line.Justification).MaximumLength(2000);
        RuleFor(line => line.PeriodTargets).NotEmpty().Must(items => items.Count <= 100);
        RuleFor(line => line.PeriodTargets).Must(items => items.Select(item => item.FiscalPeriodId).Distinct().Count() == items.Count)
            .WithMessage("Each fiscal period may appear once per plan line.");
        RuleFor(line => line.PeriodTargets.Sum(target => target.NewHireSlots))
            .Equal(line => line.NewHireSlots)
            .WithMessage("The period distribution for new positions must equal the line's new-position count.");
        RuleFor(line => line.PeriodTargets.Sum(target => target.ReplacementSlots))
            .Equal(line => line.ReplacementSlots)
            .WithMessage("The period distribution for replacements must equal the line's replacement count.");
        RuleForEach(line => line.PeriodTargets).SetValidator(new WorkforcePlanPeriodTargetRequestValidator());
    }
}

public sealed class WorkforcePlanPeriodTargetRequestValidator : AbstractValidator<WorkforcePlanPeriodTargetRequest>
{
    public WorkforcePlanPeriodTargetRequestValidator()
    {
        RuleFor(target => target.FiscalPeriodId).GreaterThan(0);
        RuleFor(target => target.NewHireSlots).GreaterThanOrEqualTo(0);
        RuleFor(target => target.ReplacementSlots).GreaterThanOrEqualTo(0);
    }
}

public sealed class SubmitWorkforcePlanCommandValidator : AbstractValidator<SubmitWorkforcePlanCommand>
{
    public SubmitWorkforcePlanCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforcePlanCommandValidation.IsRowVersion);
    }
}

public sealed class BeginWorkforcePlanReviewCommandValidator : AbstractValidator<BeginWorkforcePlanReviewCommand>
{
    public BeginWorkforcePlanReviewCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforcePlanCommandValidation.IsRowVersion);
    }
}

public sealed class ApproveWorkforcePlanCommandValidator : AbstractValidator<ApproveWorkforcePlanCommand>
{
    public ApproveWorkforcePlanCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforcePlanCommandValidation.IsRowVersion);
    }
}

public sealed class RejectWorkforcePlanCommandValidator : AbstractValidator<RejectWorkforcePlanCommand>
{
    public RejectWorkforcePlanCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.Reason).NotEmpty().MaximumLength(2000);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforcePlanCommandValidation.IsRowVersion);
    }
}

public sealed class CreateWorkforcePlanRevisionCommandValidator : AbstractValidator<CreateWorkforcePlanRevisionCommand>
{
    public CreateWorkforcePlanRevisionCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforcePlanCommandValidation.IsRowVersion);
    }
}

public sealed class ArchiveWorkforcePlanCommandValidator : AbstractValidator<ArchiveWorkforcePlanCommand>
{
    public ArchiveWorkforcePlanCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforcePlanCommandValidation.IsRowVersion);
    }
}

public sealed class RestoreWorkforcePlanCommandValidator : AbstractValidator<RestoreWorkforcePlanCommand>
{
    public RestoreWorkforcePlanCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(WorkforcePlanCommandValidation.IsRowVersion);
    }
}

public sealed class CreateWorkforcePlanCommandHandler(
    IWorkforcePlanWriteStore writeStore,
    IWorkforcePlanReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    WorkforcePlanEffects effects,
    WorkforcePlanErrors errors)
    : ICommandHandler<CreateWorkforcePlanCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(CreateWorkforcePlanCommand command, CancellationToken cancellationToken)
    {
        if (!TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);

        var request = command.Request;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var fiscalYear = await writeStore.GetFiscalYearAsync(request.FiscalYearId, token);
                if (fiscalYear is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotFound);
                if (fiscalYear.Status is not (nameof(FiscalYearStatus.Draft) or nameof(FiscalYearStatus.Open)))
                    return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearMustBeOpen);

                var code = request.PlanCode.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, request.FiscalYearId, null, token))
                    return Result.Failure<WorkforcePlanDetailResponse>(errors.DuplicateCode);

                var plan = new WorkforcePlan(code, request.FiscalYearId, request.TitleEn, request.TitleAr, request.Description);
                plan.TenantId = tenantId;
                plan.CompanyId = companyId;
                var buildFailure = await WorkforcePlanCommandSupport.ApplyLinesAsync(plan, request.Lines, fiscalYear, writeStore, timeProvider, errors, token);
                if (buildFailure is not null) return Result.Failure<WorkforcePlanDetailResponse>(buildFailure);
                writeStore.Add(plan);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await readStore.GetByIdAsync(plan.Id, token))!);
            }, cancellationToken);

        if (result.IsSuccess) effects.Changed(result.Value.Id, "Add");
        return result;
    }

    internal static bool TryGetScope(ICurrentActor currentActor, out string tenantId, out int companyId)
    {
        tenantId = currentActor.TenantId ?? string.Empty;
        companyId = currentActor.CompanyId.GetValueOrDefault();
        return tenantId.Length > 0 && companyId > 0;
    }
}

public sealed class UpdateWorkforcePlanCommandHandler(
    IWorkforcePlanWriteStore writeStore,
    IWorkforcePlanReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    WorkforcePlanEffects effects,
    WorkforcePlanErrors errors)
    : ICommandHandler<UpdateWorkforcePlanCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(UpdateWorkforcePlanCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var plan = await writeStore.GetForUpdateAsync(command.Id, token);
                if (plan is null || plan.IsDeleted) return Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound);
                var fiscalYear = await writeStore.GetFiscalYearAsync(plan.FiscalYearId, token);
                if (fiscalYear is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotFound);
                if (fiscalYear.Status is not (nameof(FiscalYearStatus.Draft) or nameof(FiscalYearStatus.Open)))
                    return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotEditable);
                writeStore.ApplyRowVersion(plan, command.Request.RowVersion);
                plan.UpdateDraft(command.Request.TitleEn, command.Request.TitleAr, command.Request.Description);
                writeStore.RemovePeriodTargets(plan.Lines.SelectMany(line => line.PeriodTargets).ToArray());
                writeStore.RemoveLines(plan.Lines.ToArray());
                plan.RemoveDraftLines();
                var buildFailure = await WorkforcePlanCommandSupport.ApplyLinesAsync(plan, command.Request.Lines, fiscalYear, writeStore, timeProvider, errors, token);
                if (buildFailure is not null) return Result.Failure<WorkforcePlanDetailResponse>(buildFailure);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await readStore.GetByIdAsync(plan.Id, token))!);
            }, cancellationToken);

        if (result.IsSuccess) effects.Changed(result.Value.Id, "Update");
        return result;
    }
}

public sealed class SubmitWorkforcePlanCommandHandler(IWorkforcePlanWriteStore store, IWorkforcePlanReadStore reads, IUnitOfWork uow, ICurrentActor actor, TimeProvider clock, WorkforcePlanEffects effects, WorkforcePlanErrors errors)
    : ICommandHandler<SubmitWorkforcePlanCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(SubmitWorkforcePlanCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var plan = await store.GetForUpdateAsync(command.Id, token);
            if (plan is null || plan.IsDeleted) return Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound);
            var fiscalYear = await store.GetFiscalYearAsync(plan.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotFound);
            if (!string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal)) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearMustBeOpen);
            store.ApplyRowVersion(plan, command.RowVersion);
            try { plan.Submit(clock.GetUtcNow(), actor.UserId ?? string.Empty); }
            catch (DomainRuleException) { return Result.Failure<WorkforcePlanDetailResponse>(errors.InvalidTransition); }
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(plan.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.Changed(result.Value.Id, "Submit");
        return result;
    }
}

public sealed class BeginWorkforcePlanReviewCommandHandler(IWorkforcePlanWriteStore store, IWorkforcePlanReadStore reads, IUnitOfWork uow, ICurrentActor actor, WorkforcePlanEffects effects, WorkforcePlanErrors errors)
    : ICommandHandler<BeginWorkforcePlanReviewCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(BeginWorkforcePlanReviewCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var plan = await store.GetForUpdateAsync(command.Id, token);
            if (plan is null || plan.IsDeleted) return Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound);
            var fiscalYear = await store.GetFiscalYearAsync(plan.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotFound);
            if (!string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal))
                return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearMustBeOpen);
            store.ApplyRowVersion(plan, command.RowVersion);
            try { plan.BeginReview(); }
            catch (DomainRuleException) { return Result.Failure<WorkforcePlanDetailResponse>(errors.InvalidTransition); }
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(plan.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.Changed(result.Value.Id, "BeginReview");
        return result;
    }
}

public sealed class ApproveWorkforcePlanCommandHandler(IWorkforcePlanWriteStore store, IWorkforcePlanReadStore reads, IUnitOfWork uow, ICurrentActor actor, TimeProvider clock, WorkforcePlanEffects effects, WorkforcePlanErrors errors)
    : ICommandHandler<ApproveWorkforcePlanCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(ApproveWorkforcePlanCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var plan = await store.GetForUpdateAsync(command.Id, token);
            if (plan is null || plan.IsDeleted) return Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound);
            var fiscalYear = await store.GetFiscalYearAsync(plan.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotFound);
            store.ApplyRowVersion(plan, command.RowVersion);
            // Temporary policy: the built-in admin may approve its own plan until dedicated
            // approval permissions with separation-of-duties are introduced.
            var allowSelfApproval = actor.IsInRole(AppRoles.admin);
            try { plan.Approve(clock.GetUtcNow(), actor.UserId ?? string.Empty, string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal), allowSelfApproval); }
            catch (DomainRuleException exception) when (exception.Code == "WorkforcePlan.FiscalYearMustBeOpen") { return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearMustBeOpen); }
            catch (DomainRuleException exception) when (exception.Code == "WorkforcePlan.SelfApproval") { return Result.Failure<WorkforcePlanDetailResponse>(errors.SelfApproval); }
            catch (DomainRuleException) { return Result.Failure<WorkforcePlanDetailResponse>(errors.InvalidTransition); }
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(plan.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.Changed(result.Value.Id, "Approve");
        return result;
    }
}

public sealed class RejectWorkforcePlanCommandHandler(IWorkforcePlanWriteStore store, IWorkforcePlanReadStore reads, IUnitOfWork uow, ICurrentActor actor, TimeProvider clock, WorkforcePlanEffects effects, WorkforcePlanErrors errors)
    : ICommandHandler<RejectWorkforcePlanCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(RejectWorkforcePlanCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var plan = await store.GetForUpdateAsync(command.Id, token);
            if (plan is null || plan.IsDeleted) return Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound);
            var fiscalYear = await store.GetFiscalYearAsync(plan.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotFound);
            if (!string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal))
                return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearMustBeOpen);
            store.ApplyRowVersion(plan, command.RowVersion);
            try { plan.Reject(clock.GetUtcNow(), actor.UserId ?? string.Empty, command.Reason); }
            catch (DomainRuleException) { return Result.Failure<WorkforcePlanDetailResponse>(errors.InvalidTransition); }
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(plan.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.Changed(result.Value.Id, "Reject");
        return result;
    }
}

public sealed class CreateWorkforcePlanRevisionCommandHandler(IWorkforcePlanWriteStore store, IWorkforcePlanReadStore reads, IUnitOfWork uow, ICurrentActor actor, WorkforcePlanEffects effects, WorkforcePlanErrors errors)
    : ICommandHandler<CreateWorkforcePlanRevisionCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(CreateWorkforcePlanRevisionCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var previous = await store.GetForUpdateAsync(command.Id, token);
            if (previous is null || previous.IsDeleted) return Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound);
            store.ApplyRowVersion(previous, command.RowVersion);
            if (previous.Status is not (Domain.WorkforcePlanning.Enums.WorkforcePlanStatus.Approved or Domain.WorkforcePlanning.Enums.WorkforcePlanStatus.Superseded))
                return Result.Failure<WorkforcePlanDetailResponse>(errors.InvalidTransition);
            var fiscalYear = await store.GetFiscalYearAsync(previous.FiscalYearId, token);
            if (fiscalYear is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearNotFound);
            if (!string.Equals(fiscalYear.Status, nameof(FiscalYearStatus.Open), StringComparison.Ordinal))
                return Result.Failure<WorkforcePlanDetailResponse>(errors.FiscalYearMustBeOpen);
            var revision = new WorkforcePlan(previous.PlanCode, previous.FiscalYearId, previous.TitleEn, previous.TitleAr, previous.Description, previous.RevisionNumber + 1, previous.PlanSeriesId, previous.Id)
            {
                TenantId = previous.TenantId,
                CompanyId = previous.CompanyId
            };
            foreach (var line in previous.Lines)
            {
                var copy = revision.AddLine(line.PositionId, line.TargetBranchId, line.DepartmentId, line.DivisionId, line.BaselineHeadcount, line.BaselineAsOfDate, line.NewHireSlots, line.ReplacementSlots, line.Justification);
                foreach (var period in line.PeriodTargets) copy.AddPeriodTarget(period.FiscalPeriodId, period.NewHireSlots, period.ReplacementSlots);
            }
            store.Add(revision);
            await uow.SaveChangesAsync(token);
            return Result.Success((await reads.GetByIdAsync(revision.Id, token))!);
        }, cancellationToken);
        if (result.IsSuccess) effects.Changed(result.Value.Id, "CreateRevision");
        return result;
    }
}

public sealed class ArchiveWorkforcePlanCommandHandler(
    IWorkforcePlanWriteStore store,
    IUnitOfWork uow,
    ICurrentActor actor,
    TimeProvider clock,
    WorkforcePlanEffects effects,
    WorkforcePlanErrors errors)
    : ICommandHandler<ArchiveWorkforcePlanCommand, Result>
{
    public async Task<Result> Handle(ArchiveWorkforcePlanCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.CompanyContextRequired);

        var changed = false;
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var plan = await store.GetForUpdateAsync(command.Id, token);
            if (plan is null) return Result.Failure(errors.NotFound);
            if (plan.IsDeleted) return Result.Success();

            store.ApplyRowVersion(plan, command.RowVersion);
            try { plan.EnsureCanArchive(); }
            catch (DomainRuleException) { return Result.Failure(errors.NotArchivable); }

            plan.IsDeleted = true;
            plan.DeletedById = actor.UserId;
            plan.DeletedByPc = Environment.MachineName;
            plan.DeletedOn = clock.GetUtcNow().UtcDateTime;
            await uow.SaveChangesAsync(token);
            changed = true;
            return Result.Success();
        }, cancellationToken);

        if (result.IsSuccess && changed) effects.Changed(command.Id, "Archive");
        return result;
    }
}

public sealed class RestoreWorkforcePlanCommandHandler(
    IWorkforcePlanWriteStore store,
    IWorkforcePlanReadStore reads,
    IUnitOfWork uow,
    ICurrentActor actor,
    WorkforcePlanEffects effects,
    WorkforcePlanErrors errors)
    : ICommandHandler<RestoreWorkforcePlanCommand, Result<WorkforcePlanDetailResponse>>
{
    public async Task<Result<WorkforcePlanDetailResponse>> Handle(RestoreWorkforcePlanCommand command, CancellationToken cancellationToken)
    {
        if (!CreateWorkforcePlanCommandHandler.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<WorkforcePlanDetailResponse>(errors.CompanyContextRequired);

        var changed = false;
        var result = await uow.ExecuteAtomicallyAsync([WorkforcePlanLocks.Company(tenantId, companyId)], async token =>
        {
            var plan = await store.GetForUpdateAsync(command.Id, token);
            if (plan is null) return Result.Failure<WorkforcePlanDetailResponse>(errors.NotFound);
            if (!plan.IsDeleted)
                return Result.Success((await reads.GetByIdAsync(plan.Id, token))!);

            store.ApplyRowVersion(plan, command.RowVersion);
            try { plan.EnsureCanRestore(); }
            catch (DomainRuleException) { return Result.Failure<WorkforcePlanDetailResponse>(errors.NotRestorable); }

            plan.IsDeleted = false;
            plan.DeletedById = null;
            plan.DeletedByPc = null;
            plan.DeletedOn = null;
            await uow.SaveChangesAsync(token);
            changed = true;
            return Result.Success((await reads.GetByIdAsync(plan.Id, token))!);
        }, cancellationToken);

        if (result.IsSuccess && changed) effects.Changed(result.Value.Id, "Restore");
        return result;
    }
}

internal static class WorkforcePlanCommandSupport
{
    public static async Task<Error?> ApplyLinesAsync(
        WorkforcePlan plan,
        IReadOnlyList<WorkforcePlanLineRequest> requests,
        FiscalYearPlanningSnapshot fiscalYear,
        IWorkforcePlanWriteStore store,
        TimeProvider clock,
        WorkforcePlanErrors errors,
        CancellationToken cancellationToken)
    {
        var seen = new HashSet<(int PositionId, int? BranchId)>();
        foreach (var request in requests)
        {
            if (!seen.Add((request.PositionId, request.TargetBranchId))) return errors.DuplicateLine;
            var position = await store.GetPositionAsync(request.PositionId, cancellationToken);
            if (position is null) return errors.PositionNotFound;
            if (request.TargetBranchId.HasValue && !await store.IsBranchAvailableAsync(request.TargetBranchId.Value, cancellationToken))
                return errors.BranchNotFound;
            if (position.DepartmentBranchId.HasValue && request.TargetBranchId != position.DepartmentBranchId)
                return errors.PositionBranchMismatch;
            var baselineAsOfDate = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
            var line = plan.AddLine(
                position.Id,
                request.TargetBranchId,
                position.DepartmentId,
                position.DivisionId,
                await store.GetBaselineHeadcountAsync(position.Id, request.TargetBranchId, baselineAsOfDate, cancellationToken),
                baselineAsOfDate,
                request.NewHireSlots,
                request.ReplacementSlots,
                request.Justification);
            foreach (var period in request.PeriodTargets)
            {
                if (!fiscalYear.PeriodIds.Contains(period.FiscalPeriodId)) return errors.PeriodNotFound;
                line.AddPeriodTarget(period.FiscalPeriodId, period.NewHireSlots, period.ReplacementSlots);
            }
            try { line.ValidatePeriodTotals(); }
            catch (DomainRuleException) { return errors.InvalidTransition; }
        }
        return null;
    }
}
