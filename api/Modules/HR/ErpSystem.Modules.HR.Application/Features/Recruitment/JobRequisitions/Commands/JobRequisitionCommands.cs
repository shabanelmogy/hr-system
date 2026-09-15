using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Commands;

public sealed record CreateJobRequisitionCommand(JobRequisitionMutation Mutation) : ICommand<Result<JobRequisitionDto>>;
public sealed record SubmitJobRequisitionCommand(int Id) : ICommand<Result<JobRequisitionDto>>;
public sealed record ApproveJobRequisitionCommand(int Id) : ICommand<Result<JobRequisitionDto>>;
public sealed record RejectJobRequisitionCommand(int Id, string Reason) : ICommand<Result<JobRequisitionDto>>;
public sealed record CancelJobRequisitionCommand(int Id, string Reason) : ICommand<Result<JobRequisitionDto>>;

public sealed class CreateJobRequisitionCommandHandler(
    IJobRequisitionRepository repository,
    IJobRequisitionReadStore readStore,
    IRecruitmentRequisitionPolicy policy,
    IRecruitmentActorEmployeeSource actorEmployees,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    IFiscalYearPlanningSource fiscalYears,
    TimeProvider clock)
    : ICommandHandler<CreateJobRequisitionCommand, Result<JobRequisitionDto>>
{
    public async Task<Result<JobRequisitionDto>> Handle(
        CreateJobRequisitionCommand command,
        CancellationToken cancellationToken)
    {
        return command.Mutation.StaffingRequestId.HasValue
            ? await CreatePlannedAsync(command.Mutation, cancellationToken)
            : await CreateLegacyAsync(command.Mutation, cancellationToken);
    }

    private async Task<Result<JobRequisitionDto>> CreateLegacyAsync(
        JobRequisitionMutation mutation,
        CancellationToken cancellationToken)
    {
        if (policy.RequireStaffingRequestForNewRequisitions)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.StaffingRequestRequired);

        var position = await repository.GetPositionAsync(mutation.PositionId, cancellationToken);
        if (position is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.PositionNotFound);

        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        var activeHeadcount = await repository.GetActiveHeadcountAsync(mutation.PositionId, today, cancellationToken);
        var pendingPositions = await repository.GetPendingRequestedPositionsAsync(mutation.PositionId, cancellationToken);
        var availableHeadcount = Math.Max(0, position.TargetHeadcount - (activeHeadcount + pendingPositions));

        bool isBudgeted;
        if (mutation.Type == RequisitionType.Replacement)
        {
            if (!mutation.ReplacementEmployeeId.HasValue ||
                !await repository.EmployeeExistsAsync(mutation.ReplacementEmployeeId.Value, cancellationToken))
                return Result.Failure<JobRequisitionDto>(RecruitmentErrors.ReplacementEmployeeRequired);
            isBudgeted = mutation.IsBudgeted ?? true;
        }
        else if (mutation.RequestedPositions > availableHeadcount)
        {
            isBudgeted = false;
            if (string.IsNullOrWhiteSpace(mutation.BudgetJustification))
                return Result.Failure<JobRequisitionDto>(RecruitmentErrors.BudgetJustificationRequired);
        }
        else
        {
            isBudgeted = mutation.IsBudgeted ?? true;
        }

        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.ActorEmployeeRequired);

        var requisition = CreateEntity(
            mutation,
            actorEmployeeId.Value,
            isBudgeted,
            null,
            mutation.BudgetJustification);
        repository.Add(requisition);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(await RequireReadAsync(readStore, requisition.Id, cancellationToken));
    }

    private async Task<Result<JobRequisitionDto>> CreatePlannedAsync(
        JobRequisitionMutation mutation,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.CompanyContextRequired);

        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.ActorEmployeeRequired);

        var tenantId = actor.TenantId;
        var companyId = actor.CompanyId.Value;
        var staffingRequestId = mutation.StaffingRequestId!.Value;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [
                $"Recruitment:Requisitions:{tenantId}:{companyId}",
                $"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{staffingRequestId}",
                WorkforcePlanLocks.Company(tenantId, companyId)
            ],
            async token =>
            {
                var staffing = await repository.GetStaffingRequestForUpdateAsync(staffingRequestId, token);
                if (staffing is null ||
                    staffing.Status != StaffingRequestStatus.Approved ||
                    staffing.RemainingAllocatable < mutation.RequestedPositions)
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);

                var envelope = await repository.GetEnvelopeSnapshotAsync(staffing.EnvelopeId, token);
                if (envelope is null)
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);
                if (!await repository.IsWorkforceBudgetEffectiveAsync(envelope.WorkforceBudgetId, token))
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);

                var fiscalYear = await fiscalYears.GetAsync(tenantId, companyId, envelope.FiscalYearId, token);
                if (fiscalYear?.Status.Equals("Open", StringComparison.OrdinalIgnoreCase) != true)
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);
                if (!envelope.BranchId.HasValue)
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestRequiresBranch);

                if (mutation.Type == RequisitionType.Replacement &&
                    (!mutation.ReplacementEmployeeId.HasValue ||
                     !await repository.EmployeeExistsAsync(mutation.ReplacementEmployeeId.Value, token)))
                    return Result.Failure<int>(RecruitmentErrors.ReplacementEmployeeRequired);

                var normalizedMutation = mutation with
                {
                    PositionId = envelope.PositionId,
                    BranchId = envelope.BranchId.Value,
                    DepartmentId = envelope.DepartmentId,
                    DivisionId = envelope.DivisionId
                };
                var requisition = CreateEntity(normalizedMutation, actorEmployeeId.Value, true, staffing.Id, null);
                staffing.RegisterAllocation(mutation.RequestedPositions);
                repository.Add(requisition);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(requisition.Id);
            },
            cancellationToken);

        if (result.IsFailure)
            return Result.Failure<JobRequisitionDto>(result.Error);
        return Result.Success(await RequireReadAsync(readStore, result.Value, cancellationToken));
    }

    private JobRequisition CreateEntity(
        JobRequisitionMutation mutation,
        int actorEmployeeId,
        bool isBudgeted,
        int? staffingRequestId,
        string? budgetJustification)
    {
        var requisition = new JobRequisition(
            $"REQ-{clock.GetUtcNow():yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpperInvariant()}",
            mutation.PositionId,
            mutation.BranchId,
            mutation.DepartmentId,
            actorEmployeeId,
            mutation.RequestedPositions);
        requisition.UpdateDetails(
            mutation.BusinessReason,
            mutation.EmploymentType,
            mutation.WorkArrangement,
            mutation.TargetHireDate,
            mutation.DivisionId);
        requisition.SetBudgetAndType(
            mutation.Type,
            mutation.ReplacementEmployeeId,
            isBudgeted,
            budgetJustification);
        if (staffingRequestId.HasValue)
            requisition.LinkToStaffingRequest(staffingRequestId.Value);
        return requisition;
    }

    internal static async Task<JobRequisitionDto> RequireReadAsync(
        IJobRequisitionReadStore readStore,
        int id,
        CancellationToken cancellationToken) =>
        await readStore.GetByIdAsync(id, cancellationToken)
        ?? throw new InvalidOperationException("The persisted job requisition could not be read.");
}

public sealed class SubmitJobRequisitionCommandHandler(
    IJobRequisitionRepository repository,
    IJobRequisitionReadStore readStore,
    IUnitOfWork unitOfWork,
    TimeProvider clock)
    : ICommandHandler<SubmitJobRequisitionCommand, Result<JobRequisitionDto>>
{
    public async Task<Result<JobRequisitionDto>> Handle(SubmitJobRequisitionCommand command, CancellationToken cancellationToken)
    {
        var requisition = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);
        requisition.Submit(clock.GetUtcNow());
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobRequisitionCommandHandler.RequireReadAsync(readStore, requisition.Id, cancellationToken));
    }
}

public sealed class ApproveJobRequisitionCommandHandler(
    IJobRequisitionRepository repository,
    IJobRequisitionReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    IUnitOfWork unitOfWork,
    TimeProvider clock)
    : ICommandHandler<ApproveJobRequisitionCommand, Result<JobRequisitionDto>>
{
    public async Task<Result<JobRequisitionDto>> Handle(ApproveJobRequisitionCommand command, CancellationToken cancellationToken)
    {
        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.ActorEmployeeRequired);
        var requisition = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);
        requisition.Approve(actorEmployeeId.Value, clock.GetUtcNow());
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobRequisitionCommandHandler.RequireReadAsync(readStore, requisition.Id, cancellationToken));
    }
}

public sealed class RejectJobRequisitionCommandHandler(
    IJobRequisitionRepository repository,
    IJobRequisitionReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    IUnitOfWork unitOfWork,
    TimeProvider clock)
    : ICommandHandler<RejectJobRequisitionCommand, Result<JobRequisitionDto>>
{
    public async Task<Result<JobRequisitionDto>> Handle(RejectJobRequisitionCommand command, CancellationToken cancellationToken)
    {
        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.ActorEmployeeRequired);
        var requisition = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);
        requisition.Reject(actorEmployeeId.Value, command.Reason, clock.GetUtcNow());
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobRequisitionCommandHandler.RequireReadAsync(readStore, requisition.Id, cancellationToken));
    }
}

public sealed class CancelJobRequisitionCommandHandler(
    IJobRequisitionRepository repository,
    IJobRequisitionReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor)
    : ICommandHandler<CancelJobRequisitionCommand, Result<JobRequisitionDto>>
{
    public async Task<Result<JobRequisitionDto>> Handle(CancelJobRequisitionCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.CompanyContextRequired);
        var reason = command.Reason?.Trim() ?? string.Empty;
        if (reason.Length == 0 || reason.Length > 1000)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.InvalidOperation);

        var tenantId = actor.TenantId;
        var companyId = actor.CompanyId.Value;
        var snapshot = await repository.GetCancellationSnapshotAsync(command.Id, cancellationToken);
        if (snapshot is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        var locks = new List<string> { $"Recruitment:Requisitions:{tenantId}:{companyId}:{command.Id}" };
        if (snapshot.PlanningSource == PlanningSource.Planned && snapshot.StaffingRequestId is > 0)
        {
            locks.Add($"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{snapshot.StaffingRequestId.Value}");
            if (snapshot.EnvelopeId is > 0)
                locks.Add($"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{snapshot.EnvelopeId.Value}");
        }

        try
        {
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                locks,
                async token =>
                {
                    var requisition = await repository.GetForUpdateAsync(command.Id, token);
                    if (requisition is null)
                        return Result.Failure<int>(RecruitmentErrors.JobRequisitionNotFound);
                    if (await repository.HasActiveOpeningAsync(command.Id, token))
                        return Result.Failure<int>(RecruitmentErrors.RequisitionHasActiveOpenings);
                    if (requisition.Status is not (JobRequisitionStatus.Draft or
                        JobRequisitionStatus.PendingApproval or
                        JobRequisitionStatus.Approved or
                        JobRequisitionStatus.Rejected))
                        return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                    StaffingRequest? staffing = null;
                    if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                    {
                        staffing = await repository.GetStaffingRequestForUpdateAsync(requisition.StaffingRequestId.Value, token);
                        if (staffing is null || staffing.Status != StaffingRequestStatus.Approved)
                            return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);
                    }

                    var releasablePositions = requisition.ReleasablePositions;
                    if (staffing is not null && releasablePositions > 0)
                        staffing.ReleaseAllocation(releasablePositions);
                    requisition.Cancel(reason);
                    await unitOfWork.SaveChangesAsync(token);
                    return Result.Success(requisition.Id);
                },
                cancellationToken);

            if (result.IsFailure)
                return Result.Failure<JobRequisitionDto>(result.Error);
            return Result.Success(await CreateJobRequisitionCommandHandler.RequireReadAsync(readStore, result.Value, cancellationToken));
        }
        catch (DomainRuleException)
        {
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.InvalidOperation);
        }
    }
}
