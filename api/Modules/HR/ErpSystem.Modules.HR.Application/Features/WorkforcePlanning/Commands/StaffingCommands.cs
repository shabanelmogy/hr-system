using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Enums;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Commands;

public sealed record CreateEnvelopeAmendmentCommand(CreateEnvelopeAmendmentRequest Request)
    : ICommand<Result<EnvelopeAmendmentDetailResponse>>;
public sealed record SubmitEnvelopeAmendmentCommand(int Id, string RowVersion)
    : ICommand<Result<EnvelopeAmendmentDetailResponse>>;
public sealed record ApproveEnvelopeAmendmentCommand(int Id, string RowVersion)
    : ICommand<Result<EnvelopeAmendmentDetailResponse>>;
public sealed record RejectEnvelopeAmendmentCommand(int Id, string Reason, string RowVersion)
    : ICommand<Result<EnvelopeAmendmentDetailResponse>>;

public sealed record CreateStaffingRequestCommand(CreateStaffingRequestRequest Request)
    : ICommand<Result<StaffingRequestDetailResponse>>;
public sealed record SubmitStaffingRequestCommand(int Id, string RowVersion)
    : ICommand<Result<StaffingRequestDetailResponse>>;
public sealed record ApproveStaffingRequestCommand(int Id, string RowVersion)
    : ICommand<Result<StaffingRequestDetailResponse>>;
public sealed record RejectStaffingRequestCommand(int Id, string Reason, string RowVersion)
    : ICommand<Result<StaffingRequestDetailResponse>>;
public sealed record CloseStaffingRequestCommand(int Id, StaffingRequestCloseReason CloseReason, string RowVersion)
    : ICommand<Result<StaffingRequestDetailResponse>>;

internal static class StaffingCommandValidation
{
    public static bool IsRowVersion(string value)
    {
        try { return Convert.FromBase64String(value).Length > 0; }
        catch (FormatException) { return false; }
    }
}

public sealed class CreateEnvelopeAmendmentRequestValidator : AbstractValidator<CreateEnvelopeAmendmentRequest>
{
    public CreateEnvelopeAmendmentRequestValidator()
    {
        RuleFor(request => request.EnvelopeId).GreaterThan(0);
        RuleFor(request => request.AdditionalHeadcount).GreaterThan(0);
        RuleFor(request => request.AdditionalSalaryCost).GreaterThan(0);
        RuleFor(request => request.Justification).NotEmpty().MaximumLength(2000);
    }
}

public sealed class CreateEnvelopeAmendmentCommandValidator : AbstractValidator<CreateEnvelopeAmendmentCommand>
{
    public CreateEnvelopeAmendmentCommandValidator() =>
        RuleFor(command => command.Request).SetValidator(new CreateEnvelopeAmendmentRequestValidator());
}

public sealed class SubmitEnvelopeAmendmentCommandValidator : AbstractValidator<SubmitEnvelopeAmendmentCommand>
{
    public SubmitEnvelopeAmendmentCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(StaffingCommandValidation.IsRowVersion);
    }
}

public sealed class ApproveEnvelopeAmendmentCommandValidator : AbstractValidator<ApproveEnvelopeAmendmentCommand>
{
    public ApproveEnvelopeAmendmentCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(StaffingCommandValidation.IsRowVersion);
    }
}

public sealed class RejectEnvelopeAmendmentCommandValidator : AbstractValidator<RejectEnvelopeAmendmentCommand>
{
    public RejectEnvelopeAmendmentCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.Reason).NotEmpty().MaximumLength(2000);
        RuleFor(command => command.RowVersion).NotEmpty().Must(StaffingCommandValidation.IsRowVersion);
    }
}

public sealed class CreateStaffingRequestRequestValidator : AbstractValidator<CreateStaffingRequestRequest>
{
    public CreateStaffingRequestRequestValidator()
    {
        RuleFor(request => request.EnvelopeId).GreaterThan(0);
        RuleFor(request => request.RequestedHeadcount).GreaterThan(0).LessThanOrEqualTo(10000);
        RuleFor(request => request.EstimatedAnnualSalaryPerSlot).GreaterThan(0);
        RuleFor(request => request.TargetStartDate).NotEqual(default(DateOnly));
        RuleFor(request => request.RequestType).IsInEnum();
        RuleFor(request => request.Priority).IsInEnum();
        RuleFor(request => request.Justification).NotEmpty().MaximumLength(2000);
    }
}

public sealed class CreateStaffingRequestCommandValidator : AbstractValidator<CreateStaffingRequestCommand>
{
    public CreateStaffingRequestCommandValidator() =>
        RuleFor(command => command.Request).SetValidator(new CreateStaffingRequestRequestValidator());
}

public sealed class SubmitStaffingRequestCommandValidator : AbstractValidator<SubmitStaffingRequestCommand>
{
    public SubmitStaffingRequestCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(StaffingCommandValidation.IsRowVersion);
    }
}

public sealed class ApproveStaffingRequestCommandValidator : AbstractValidator<ApproveStaffingRequestCommand>
{
    public ApproveStaffingRequestCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).NotEmpty().Must(StaffingCommandValidation.IsRowVersion);
    }
}

public sealed class RejectStaffingRequestCommandValidator : AbstractValidator<RejectStaffingRequestCommand>
{
    public RejectStaffingRequestCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.Reason).NotEmpty().MaximumLength(2000);
        RuleFor(command => command.RowVersion).NotEmpty().Must(StaffingCommandValidation.IsRowVersion);
    }
}

public sealed class CloseStaffingRequestCommandValidator : AbstractValidator<CloseStaffingRequestCommand>
{
    public CloseStaffingRequestCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.CloseReason).IsInEnum();
        RuleFor(command => command.RowVersion).NotEmpty().Must(StaffingCommandValidation.IsRowVersion);
    }
}

public sealed class CreateEnvelopeAmendmentCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<CreateEnvelopeAmendmentCommand, Result<EnvelopeAmendmentDetailResponse>>
{
    public async Task<Result<EnvelopeAmendmentDetailResponse>> Handle(CreateEnvelopeAmendmentCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.CompanyContextRequired);

        var request = command.Request;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId), WorkforcePlanLocks.Envelope(tenantId, companyId, request.EnvelopeId)],
            async token =>
            {
                var envelope = await store.GetEnvelopeForUpdateAsync(request.EnvelopeId, token);
                if (envelope is null || envelope.IsDeleted)
                    return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.EnvelopeNotFound);

                var amendment = new EnvelopeAmendment(
                    envelope.Id,
                    request.AdditionalHeadcount,
                    request.AdditionalSalaryCost,
                    request.Justification,
                    actor.UserId ?? string.Empty)
                {
                    TenantId = tenantId,
                    CompanyId = companyId
                };
                store.AddAmendment(amendment);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetAmendmentByIdAsync(amendment.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.AmendmentChanged(result.Value.Id, "Add");
        return result;
    }
}

public sealed class SubmitEnvelopeAmendmentCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<SubmitEnvelopeAmendmentCommand, Result<EnvelopeAmendmentDetailResponse>>
{
    public async Task<Result<EnvelopeAmendmentDetailResponse>> Handle(SubmitEnvelopeAmendmentCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var amendment = await store.GetAmendmentForUpdateAsync(command.Id, token);
                if (amendment is null || amendment.IsDeleted)
                    return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentNotFound);
                store.ApplyAmendmentRowVersion(amendment, command.RowVersion);
                try { amendment.Submit(clock.GetUtcNow(), actor.UserId ?? string.Empty); }
                catch (DomainRuleException) { return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentInvalidTransition); }
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetAmendmentByIdAsync(amendment.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.AmendmentChanged(result.Value.Id, "Submit");
        return result;
    }
}

public sealed class ApproveEnvelopeAmendmentCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<ApproveEnvelopeAmendmentCommand, Result<EnvelopeAmendmentDetailResponse>>
{
    public async Task<Result<EnvelopeAmendmentDetailResponse>> Handle(ApproveEnvelopeAmendmentCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var amendment = await store.GetAmendmentForUpdateAsync(command.Id, token);
                if (amendment is null || amendment.IsDeleted)
                    return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentNotFound);
                var envelope = await store.GetEnvelopeForUpdateAsync(amendment.EnvelopeId, token);
                if (envelope is null || envelope.IsDeleted)
                    return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.EnvelopeNotFound);
                var fiscalYear = await store.GetFiscalYearAsync(envelope.FiscalYearId, token);
                if (fiscalYear is null)
                    return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.FiscalYearNotFound);
                if (!string.Equals(fiscalYear.Status, "Open", StringComparison.Ordinal))
                    return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.FiscalYearMustBeOpen);
                store.ApplyAmendmentRowVersion(amendment, command.RowVersion);
                try { amendment.Approve(clock.GetUtcNow(), actor.UserId ?? string.Empty); }
                catch (DomainRuleException exception) when (exception.Code == "EnvelopeAmendment.SelfApproval") { return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentSelfApproval); }
                catch (DomainRuleException) { return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentInvalidTransition); }
                envelope.Expand(amendment.AdditionalHeadcount, amendment.AdditionalSalaryCost);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetAmendmentByIdAsync(amendment.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.AmendmentApproved(result.Value.Id, result.Value.EnvelopeId);
        return result;
    }
}

public sealed class RejectEnvelopeAmendmentCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<RejectEnvelopeAmendmentCommand, Result<EnvelopeAmendmentDetailResponse>>
{
    public async Task<Result<EnvelopeAmendmentDetailResponse>> Handle(RejectEnvelopeAmendmentCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var amendment = await store.GetAmendmentForUpdateAsync(command.Id, token);
                if (amendment is null || amendment.IsDeleted)
                    return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentNotFound);
                store.ApplyAmendmentRowVersion(amendment, command.RowVersion);
                try { amendment.Reject(clock.GetUtcNow(), actor.UserId ?? string.Empty, command.Reason); }
                catch (DomainRuleException) { return Result.Failure<EnvelopeAmendmentDetailResponse>(errors.AmendmentInvalidTransition); }
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetAmendmentByIdAsync(amendment.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.AmendmentChanged(result.Value.Id, "Reject");
        return result;
    }
}

public sealed class CreateStaffingRequestCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<CreateStaffingRequestCommand, Result<StaffingRequestDetailResponse>>
{
    public async Task<Result<StaffingRequestDetailResponse>> Handle(CreateStaffingRequestCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<StaffingRequestDetailResponse>(errors.CompanyContextRequired);

        var request = command.Request;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId), WorkforcePlanLocks.Envelope(tenantId, companyId, request.EnvelopeId)],
            async token =>
            {
                var envelope = await store.GetEnvelopeForUpdateAsync(request.EnvelopeId, token);
                if (envelope is null || envelope.IsDeleted)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.EnvelopeNotFound);
                var fiscalYear = await store.GetFiscalYearAsync(envelope.FiscalYearId, token);
                if (fiscalYear is null)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.FiscalYearNotFound);
                if (request.TargetStartDate < fiscalYear.StartDate || request.TargetStartDate > fiscalYear.EndDate)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.TargetStartOutsideFiscalYear);

                var annualized = WorkforceCostPolicy.NormalizeAnnualSalary(request.EstimatedAnnualSalaryPerSlot);
                var fiscalPerSlot = WorkforceCostPolicy.ComputeFiscalCostPerSlot(
                    annualized, request.TargetStartDate, fiscalYear.StartDate, fiscalYear.EndDate);
                var total = WorkforceCostPolicy.ComputeTotalReservedCost(fiscalPerSlot, request.RequestedHeadcount);

                var staffingRequest = new StaffingRequest(
                    envelope.Id,
                    request.RequestedHeadcount,
                    annualized,
                    fiscalPerSlot,
                    total,
                    request.TargetStartDate,
                    request.RequestType,
                    request.Priority,
                    request.Justification,
                    envelope.CurrencyCode,
                    WorkforceCostPolicy.PolicyVersion)
                {
                    TenantId = tenantId,
                    CompanyId = companyId
                };
                store.AddRequest(staffingRequest);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetRequestByIdAsync(staffingRequest.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.RequestChanged(result.Value.Id, "Add");
        return result;
    }
}

public sealed class SubmitStaffingRequestCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<SubmitStaffingRequestCommand, Result<StaffingRequestDetailResponse>>
{
    public async Task<Result<StaffingRequestDetailResponse>> Handle(SubmitStaffingRequestCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<StaffingRequestDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var staffingRequest = await store.GetRequestForUpdateAsync(command.Id, token);
                if (staffingRequest is null || staffingRequest.IsDeleted)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.NotFound);
                store.ApplyRequestRowVersion(staffingRequest, command.RowVersion);
                try { staffingRequest.Submit(clock.GetUtcNow(), actor.UserId ?? string.Empty); }
                catch (DomainRuleException) { return Result.Failure<StaffingRequestDetailResponse>(errors.InvalidTransition); }
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetRequestByIdAsync(staffingRequest.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.RequestChanged(result.Value.Id, "Submit");
        return result;
    }
}

public sealed class ApproveStaffingRequestCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<ApproveStaffingRequestCommand, Result<StaffingRequestDetailResponse>>
{
    public async Task<Result<StaffingRequestDetailResponse>> Handle(ApproveStaffingRequestCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<StaffingRequestDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var staffingRequest = await store.GetRequestForUpdateAsync(command.Id, token);
                if (staffingRequest is null || staffingRequest.IsDeleted)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.NotFound);
                var envelope = await store.GetEnvelopeForUpdateAsync(staffingRequest.EnvelopeId, token);
                if (envelope is null || envelope.IsDeleted)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.EnvelopeNotFound);
                var fiscalYear = await store.GetFiscalYearAsync(envelope.FiscalYearId, token);
                if (fiscalYear is null)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.FiscalYearNotFound);
                if (!string.Equals(fiscalYear.Status, "Open", StringComparison.Ordinal))
                    return Result.Failure<StaffingRequestDetailResponse>(errors.FiscalYearMustBeOpen);
                // Validate both capacity dimensions before changing the request status. This keeps
                // a failed approval (including a concurrent capacity race) from leaving a tracked
                // request Approved when no reservation was persisted.
                if (envelope.AvailableHeadcount < staffingRequest.RequestedHeadcount)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.InsufficientHeadcount);
                if (envelope.AvailableSalaryBudget < staffingRequest.TotalReservedCost)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.InsufficientBudget);
                store.ApplyRequestRowVersion(staffingRequest, command.RowVersion);
                try { staffingRequest.Approve(clock.GetUtcNow(), actor.UserId ?? string.Empty); }
                catch (DomainRuleException exception) when (exception.Code == "StaffingRequest.SelfApproval") { return Result.Failure<StaffingRequestDetailResponse>(errors.SelfApproval); }
                catch (DomainRuleException) { return Result.Failure<StaffingRequestDetailResponse>(errors.InvalidTransition); }
                try { envelope.Reserve(staffingRequest.RequestedHeadcount, staffingRequest.TotalReservedCost); }
                catch (DomainRuleException exception) when (exception.Code == "PositionEnvelope.InsufficientHeadcount") { return Result.Failure<StaffingRequestDetailResponse>(errors.InsufficientHeadcount); }
                catch (DomainRuleException exception) when (exception.Code == "PositionEnvelope.InsufficientBudget") { return Result.Failure<StaffingRequestDetailResponse>(errors.InsufficientBudget); }
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetRequestByIdAsync(staffingRequest.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.RequestReserved(result.Value.Id, result.Value.EnvelopeId);
        return result;
    }
}

public sealed class RejectStaffingRequestCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<RejectStaffingRequestCommand, Result<StaffingRequestDetailResponse>>
{
    public async Task<Result<StaffingRequestDetailResponse>> Handle(RejectStaffingRequestCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<StaffingRequestDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var staffingRequest = await store.GetRequestForUpdateAsync(command.Id, token);
                if (staffingRequest is null || staffingRequest.IsDeleted)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.NotFound);
                store.ApplyRequestRowVersion(staffingRequest, command.RowVersion);
                try { staffingRequest.Reject(clock.GetUtcNow(), actor.UserId ?? string.Empty, command.Reason); }
                catch (DomainRuleException) { return Result.Failure<StaffingRequestDetailResponse>(errors.InvalidTransition); }
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetRequestByIdAsync(staffingRequest.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.RequestChanged(result.Value.Id, "Reject");
        return result;
    }
}

public sealed class CloseStaffingRequestCommandHandler(
    IStaffingWriteStore store,
    IStaffingReadStore reads,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock,
    StaffingEffects effects,
    StaffingErrors errors)
    : ICommandHandler<CloseStaffingRequestCommand, Result<StaffingRequestDetailResponse>>
{
    public async Task<Result<StaffingRequestDetailResponse>> Handle(CloseStaffingRequestCommand command, CancellationToken cancellationToken)
    {
        if (!StaffingScope.TryGet(actor, out var tenantId, out var companyId))
            return Result.Failure<StaffingRequestDetailResponse>(errors.CompanyContextRequired);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [WorkforcePlanLocks.Company(tenantId, companyId)],
            async token =>
            {
                var staffingRequest = await store.GetRequestForUpdateAsync(command.Id, token);
                if (staffingRequest is null || staffingRequest.IsDeleted)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.NotFound);
                var envelope = await store.GetEnvelopeForUpdateAsync(staffingRequest.EnvelopeId, token);
                if (envelope is null || envelope.IsDeleted)
                    return Result.Failure<StaffingRequestDetailResponse>(errors.EnvelopeNotFound);
                store.ApplyRequestRowVersion(staffingRequest, command.RowVersion);
                try { staffingRequest.Close(clock.GetUtcNow(), command.CloseReason); }
                catch (DomainRuleException exception) when (exception.Code == "StaffingRequest.ActiveAllocations") { return Result.Failure<StaffingRequestDetailResponse>(errors.ActiveAllocations); }
                catch (DomainRuleException exception) when (exception.Code is "StaffingRequest.NotFulfilled" or "StaffingRequest.InvalidCloseReason") { return Result.Failure<StaffingRequestDetailResponse>(errors.InvalidCloseReason); }
                catch (DomainRuleException) { return Result.Failure<StaffingRequestDetailResponse>(errors.InvalidTransition); }
                var releasableHeadcount = staffingRequest.ReleasableHeadcount;
                var releasableCost = staffingRequest.ReleasableCost;
                if (releasableHeadcount > 0)
                {
                    try { envelope.Release(releasableHeadcount, releasableCost); }
                    catch (DomainRuleException) { return Result.Failure<StaffingRequestDetailResponse>(errors.OverRelease); }
                }
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success((await reads.GetRequestByIdAsync(staffingRequest.Id, token))!);
            },
            cancellationToken);

        if (result.IsSuccess) effects.RequestReleased(result.Value.Id, result.Value.EnvelopeId);
        return result;
    }
}

internal static class StaffingScope
{
    public static bool TryGet(ICurrentActor currentActor, out string tenantId, out int companyId)
    {
        tenantId = currentActor.TenantId ?? string.Empty;
        companyId = currentActor.CompanyId.GetValueOrDefault();
        return tenantId.Length > 0 && companyId > 0;
    }
}
