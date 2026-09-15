using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings.Abstractions;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Commands;

public sealed record CreateJobOfferCommand(JobOfferMutation Mutation) : ICommand<Result<JobOfferDto>>;
public sealed record SubmitJobOfferCommand(int Id) : ICommand<Result<JobOfferDto>>;
public sealed record ApproveJobOfferCommand(int Id) : ICommand<Result<JobOfferDto>>;
public sealed record RejectJobOfferCommand(int Id, string Reason) : ICommand<Result<JobOfferDto>>;
public sealed record IssueJobOfferCommand(int Id) : ICommand<Result<JobOfferDto>>;
public sealed record AcceptJobOfferCommand(int Id) : ICommand<Result<JobOfferDto>>;
public sealed record DeclineJobOfferCommand(int Id, string Reason) : ICommand<Result<JobOfferDto>>;

public sealed class CreateJobOfferCommandHandler(
    IJobOfferRepository repository,
    IJobOfferReadStore readStore,
    IUnitOfWork unitOfWork,
    TimeProvider clock)
    : ICommandHandler<CreateJobOfferCommand, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(CreateJobOfferCommand command, CancellationToken cancellationToken)
    {
        var mutation = command.Mutation;
        var application = await repository.GetApplicationSnapshotAsync(mutation.EmploymentApplicationId, cancellationToken);
        if (application is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.EmploymentApplicationNotFound);
        if (application.Status != ApplicationStatus.Interviewed)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.InvalidOperation);

        var opening = await repository.GetOpeningSnapshotAsync(application.JobOpeningId, cancellationToken);
        if (opening is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOpeningNotFound);

        var offer = new JobOffer(
            $"OFF-{clock.GetUtcNow():yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpperInvariant()}",
            mutation.EmploymentApplicationId,
            opening.PositionId,
            opening.BranchId,
            opening.DepartmentId,
            mutation.BaseSalary,
            mutation.CurrencyCode,
            mutation.PayFrequency,
            mutation.EmploymentType,
            mutation.WorkArrangement,
            mutation.ProposedStartDate,
            opening.DivisionId);

        if (!string.IsNullOrWhiteSpace(mutation.TermsAndConditions))
        {
            offer.UpdateTerms(
                mutation.BaseSalary,
                mutation.CurrencyCode,
                mutation.PayFrequency,
                mutation.EmploymentType,
                mutation.WorkArrangement,
                mutation.ProposedStartDate,
                mutation.TermsAndConditions);
        }

        repository.Add(offer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(await RequireReadAsync(readStore, offer.Id, cancellationToken));
    }

    internal static async Task<JobOfferDto> RequireReadAsync(
        IJobOfferReadStore readStore,
        int id,
        CancellationToken cancellationToken) =>
        await readStore.GetByIdAsync(id, cancellationToken)
        ?? throw new InvalidOperationException("The persisted job offer could not be read.");
}

public sealed class SubmitJobOfferCommandHandler(
    IJobOfferRepository repository,
    IJobOfferReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    IFiscalYearPlanningSource fiscalYears,
    TimeProvider clock)
    : ICommandHandler<SubmitJobOfferCommand, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(SubmitJobOfferCommand command, CancellationToken cancellationToken)
    {
        if (!OfferScope.TryGet(actor, out var tenantId, out var companyId, out var actorUserId))
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);

        var locks = new List<string>
        {
            $"Recruitment:Offers:{tenantId}:{companyId}:{command.Id}",
            WorkforcePlanLocks.Company(tenantId, companyId)
        };
        var lineage = await repository.GetLineageAsync(command.Id, cancellationToken);
        OfferLocks.AddPlanning(locks, tenantId, companyId, lineage);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            locks,
            async token =>
            {
                var offer = await repository.GetForUpdateAsync(command.Id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var application = await repository.GetApplicationSnapshotAsync(offer.EmploymentApplicationId, token);
                var opening = application is null ? null : await repository.GetOpeningSnapshotAsync(application.JobOpeningId, token);
                var requisition = opening is null ? null : await repository.GetRequisitionSnapshotAsync(opening.JobRequisitionId, token);
                if (requisition is null)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                var annualSalary = OfferSalary.Annualize(offer.BaseSalary, offer.PayFrequency);
                var fiscalCost = annualSalary;
                var delta = 0m;
                if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                {
                    var staffing = await repository.GetStaffingRequestSnapshotAsync(requisition.StaffingRequestId.Value, token);
                    if (staffing is null ||
                        !string.Equals(staffing.CurrencyCode, offer.CurrencyCode, StringComparison.OrdinalIgnoreCase))
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    var envelope = await repository.GetEnvelopeSnapshotAsync(staffing.EnvelopeId, token);
                    if (envelope is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    var fiscalYear = await fiscalYears.GetAsync(tenantId, companyId, envelope.FiscalYearId, token);
                    if (fiscalYear is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    fiscalCost = WorkforceCostPolicy.ComputeFiscalCostPerSlot(
                        annualSalary,
                        offer.ProposedStartDate,
                        fiscalYear.StartDate,
                        fiscalYear.EndDate);
                    delta = fiscalCost - staffing.EstimatedFiscalYearCostPerSlot;
                }

                var now = clock.GetUtcNow();
                try
                {
                    offer.SubmitForApproval(
                        now,
                        actorUserId,
                        annualSalary,
                        fiscalCost,
                        delta,
                        WorkforceCostPolicy.PolicyVersion);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }
                repository.AddHistory(new JobOfferApprovalHistory(
                    offer.Id, "Submitted", actorUserId, now, JobOfferStatus.Draft, JobOfferStatus.PendingApproval));
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);

        return await OfferResult.ToDtoAsync(result, readStore, cancellationToken);
    }
}

public sealed class ApproveJobOfferCommandHandler(
    IJobOfferRepository repository,
    IJobOfferReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock)
    : ICommandHandler<ApproveJobOfferCommand, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(ApproveJobOfferCommand command, CancellationToken cancellationToken)
    {
        if (!OfferScope.TryGet(actor, out var tenantId, out var companyId, out var actorUserId))
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);

        var locks = new List<string>
        {
            $"Recruitment:Offers:{tenantId}:{companyId}:{command.Id}",
            WorkforcePlanLocks.Company(tenantId, companyId)
        };
        var lineage = await repository.GetLineageAsync(command.Id, cancellationToken);
        OfferLocks.AddFull(locks, tenantId, companyId, lineage);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            locks,
            async token =>
            {
                var offer = await repository.GetForUpdateAsync(command.Id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                if (offer.Status != JobOfferStatus.PendingApproval)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                if (string.Equals(actorUserId, offer.ApprovalSubmittedById, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(actorUserId, offer.CreatedById, StringComparison.OrdinalIgnoreCase))
                    return Result.Failure<int>(RecruitmentErrors.JobOfferSelfApproval);

                var application = await repository.GetApplicationSnapshotAsync(offer.EmploymentApplicationId, token);
                if (application is null)
                    return Result.Failure<int>(RecruitmentErrors.EmploymentApplicationNotFound);
                var opening = await repository.GetOpeningSnapshotAsync(application.JobOpeningId, token);
                if (opening is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOpeningNotFound);
                var requisition = await repository.GetRequisitionSnapshotAsync(opening.JobRequisitionId, token);
                if (requisition is null)
                    return Result.Failure<int>(RecruitmentErrors.JobRequisitionNotFound);

                PositionEnvelope? envelope = null;
                if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                {
                    var staffing = await repository.GetStaffingRequestSnapshotAsync(requisition.StaffingRequestId.Value, token);
                    if (staffing is null ||
                        !string.Equals(staffing.CurrencyCode, offer.CurrencyCode, StringComparison.OrdinalIgnoreCase))
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    envelope = await repository.GetEnvelopeForUpdateAsync(staffing.EnvelopeId, token);
                    if (envelope is null ||
                        offer.ReservationDelta > 0 && envelope.AvailableSalaryBudget < offer.ReservationDelta ||
                        offer.ReservationDelta < 0 && envelope.ReservedSalaryBudget < -offer.ReservationDelta)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }

                var now = clock.GetUtcNow();
                try
                {
                    offer.Approve(now, actorUserId);
                }
                catch (DomainRuleException exception) when (exception.Code == "Recruitment.JobOffer.SelfApproval")
                {
                    return Result.Failure<int>(RecruitmentErrors.JobOfferSelfApproval);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }

                if (envelope is not null && offer.ReservationDelta > 0)
                {
                    try { envelope.AdjustReservedSalary(offer.ReservationDelta); }
                    catch (DomainRuleException) { return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity); }
                }

                repository.AddHistory(new JobOfferApprovalHistory(
                    offer.Id, "Approved", actorUserId, now, JobOfferStatus.PendingApproval, JobOfferStatus.Approved));
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);

        return await OfferResult.ToDtoAsync(result, readStore, cancellationToken);
    }
}

public sealed class RejectJobOfferCommandHandler(
    IJobOfferRepository repository,
    IJobOfferReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock)
    : ICommandHandler<RejectJobOfferCommand, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(RejectJobOfferCommand command, CancellationToken cancellationToken)
    {
        if (!OfferScope.TryGet(actor, out var tenantId, out var companyId, out var actorUserId))
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);
        var reason = command.Reason?.Trim() ?? string.Empty;
        if (reason.Length == 0 || reason.Length > 1000)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.InvalidOperation);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [$"Recruitment:Offers:{tenantId}:{companyId}:{command.Id}"],
            async token =>
            {
                var offer = await repository.GetForUpdateAsync(command.Id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var previousStatus = offer.Status;
                var now = clock.GetUtcNow();
                try { offer.RejectApproval(now, actorUserId, reason); }
                catch (DomainRuleException) { return Result.Failure<int>(RecruitmentErrors.InvalidOperation); }
                repository.AddHistory(new JobOfferApprovalHistory(
                    offer.Id, "Rejected", actorUserId, now, previousStatus, JobOfferStatus.Draft, reason));
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);

        return await OfferResult.ToDtoAsync(result, readStore, cancellationToken);
    }
}

public sealed class IssueJobOfferCommandHandler(
    IJobOfferRepository repository,
    IJobOfferReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    IRecruitmentSettingsRepository settingsRepository,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock)
    : ICommandHandler<IssueJobOfferCommand, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(IssueJobOfferCommand command, CancellationToken cancellationToken)
    {
        if (!OfferScope.TryGet(actor, out var tenantId, out var companyId, out var actorUserId))
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);
        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.ActorEmployeeRequired);
        var lineage = await repository.GetLineageAsync(command.Id, cancellationToken);
        if (lineage is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);
        var policy = await settingsRepository.GetPolicyAsync(cancellationToken) ?? RecruitmentSettingsDefaults.Policy();

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [
                WorkforcePlanLocks.Company(tenantId, companyId),
                $"Recruitment:Applications:{tenantId}:{companyId}:{lineage.ApplicationId}",
                $"Recruitment:Offers:{tenantId}:{companyId}:{command.Id}"
            ],
            async token =>
            {
                var offer = await repository.GetForUpdateAsync(command.Id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var application = await repository.GetApplicationForUpdateAsync(offer.EmploymentApplicationId, token);
                if (application is null)
                    return Result.Failure<int>(RecruitmentErrors.EmploymentApplicationNotFound);
                if (application.Status != ApplicationStatus.Interviewed)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                var now = clock.GetUtcNow();
                var previousStatus = offer.Status;
                try
                {
                    offer.Issue(now, now.AddDays(policy.OfferExpiryDays));
                    application.RecordOfferIssued(now, actorEmployeeId.Value);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }
                repository.AddHistory(new JobOfferApprovalHistory(
                    offer.Id, "Issued", actorUserId, now, previousStatus, JobOfferStatus.Issued));
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);

        return await OfferResult.ToDtoAsync(result, readStore, cancellationToken);
    }
}

public sealed class AcceptJobOfferCommandHandler(
    IJobOfferRepository repository,
    IJobOfferReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock)
    : ICommandHandler<AcceptJobOfferCommand, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(AcceptJobOfferCommand command, CancellationToken cancellationToken)
    {
        if (!OfferScope.TryGet(actor, out var tenantId, out var companyId, out var actorUserId))
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);
        var lineage = await repository.GetLineageAsync(command.Id, cancellationToken);
        if (lineage is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [
                WorkforcePlanLocks.Company(tenantId, companyId),
                $"Recruitment:Applications:{tenantId}:{companyId}:{lineage.ApplicationId}",
                $"Recruitment:Offers:{tenantId}:{companyId}:{command.Id}"
            ],
            async token =>
            {
                var offer = await repository.GetForUpdateAsync(command.Id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var application = await repository.GetApplicationForUpdateAsync(offer.EmploymentApplicationId, token);
                if (application is null)
                    return Result.Failure<int>(RecruitmentErrors.EmploymentApplicationNotFound);
                if (application.Status != ApplicationStatus.OfferIssued)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                var now = clock.GetUtcNow();
                var previousStatus = offer.Status;
                try
                {
                    offer.Accept(now);
                    application.RecordOfferAccepted(now);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }
                repository.AddHistory(new JobOfferApprovalHistory(
                    offer.Id, "Accepted", actorUserId, now, previousStatus, JobOfferStatus.Accepted));
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);

        return await OfferResult.ToDtoAsync(result, readStore, cancellationToken);
    }
}

public sealed class DeclineJobOfferCommandHandler(
    IJobOfferRepository repository,
    IJobOfferReadStore readStore,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock)
    : ICommandHandler<DeclineJobOfferCommand, Result<JobOfferDto>>
{
    public async Task<Result<JobOfferDto>> Handle(DeclineJobOfferCommand command, CancellationToken cancellationToken)
    {
        if (!OfferScope.TryGet(actor, out var tenantId, out var companyId, out var actorUserId))
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);
        var reason = command.Reason?.Trim() ?? string.Empty;
        if (reason.Length == 0 || reason.Length > 1000)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.InvalidOperation);

        var locks = new List<string>
        {
            $"Recruitment:Offers:{tenantId}:{companyId}:{command.Id}",
            WorkforcePlanLocks.Company(tenantId, companyId)
        };
        var lineage = await repository.GetLineageAsync(command.Id, cancellationToken);
        OfferLocks.AddFull(locks, tenantId, companyId, lineage);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            locks,
            async token =>
            {
                var offer = await repository.GetForUpdateAsync(command.Id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var application = await repository.GetApplicationForUpdateAsync(offer.EmploymentApplicationId, token);
                PositionEnvelope? envelope = null;
                if (application is not null)
                {
                    var opening = await repository.GetOpeningSnapshotAsync(application.JobOpeningId, token);
                    var requisition = opening is null ? null : await repository.GetRequisitionSnapshotAsync(opening.JobRequisitionId, token);
                    if (requisition?.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                    {
                        var staffing = await repository.GetStaffingRequestSnapshotAsync(requisition.StaffingRequestId.Value, token);
                        if (staffing is null)
                            return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                        envelope = await repository.GetEnvelopeForUpdateAsync(staffing.EnvelopeId, token);
                        if (envelope is null || offer.ReservationDelta > 0 && envelope.ReservedSalaryBudget < offer.ReservationDelta)
                            return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    }
                }

                var now = clock.GetUtcNow();
                try
                {
                    offer.Decline(reason, now);
                    if (application is not null && application.Status == ApplicationStatus.OfferIssued)
                        application.RecordOfferDeclined(reason, now);
                    if (envelope is not null && offer.ReservationDelta > 0)
                        envelope.AdjustReservedSalary(-offer.ReservationDelta);
                }
                catch (DomainRuleException exception) when (exception.Code is "PositionEnvelope.OverRelease" or "PositionEnvelope.InsufficientBudget")
                {
                    return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }

                repository.AddHistory(new JobOfferApprovalHistory(
                    offer.Id, "Declined", actorUserId, now, JobOfferStatus.Issued, JobOfferStatus.Declined, reason));
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);

        return await OfferResult.ToDtoAsync(result, readStore, cancellationToken);
    }
}

internal static class OfferScope
{
    public static bool TryGet(ICurrentActor actor, out string tenantId, out int companyId, out string userId)
    {
        tenantId = actor.TenantId ?? string.Empty;
        companyId = actor.CompanyId ?? 0;
        userId = actor.UserId ?? string.Empty;
        return tenantId.Length > 0 && companyId > 0 && userId.Length > 0;
    }
}

internal static class OfferSalary
{
    public static decimal Annualize(decimal salary, PayFrequency frequency) =>
        WorkforceCostPolicy.NormalizeAnnualSalary(frequency switch
        {
            PayFrequency.Hourly => salary * 2080m,
            PayFrequency.Daily => salary * 260m,
            PayFrequency.Weekly => salary * 52m,
            PayFrequency.Monthly => salary * 12m,
            PayFrequency.Annual => salary,
            _ => throw new ArgumentOutOfRangeException(nameof(frequency))
        });
}

internal static class OfferLocks
{
    public static void AddPlanning(List<string> locks, string tenantId, int companyId, JobOfferLineage? lineage)
    {
        if (lineage?.StaffingRequestId is > 0)
            locks.Add($"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{lineage.StaffingRequestId.Value}");
        if (lineage?.EnvelopeId is > 0)
            locks.Add($"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{lineage.EnvelopeId.Value}");
    }

    public static void AddFull(List<string> locks, string tenantId, int companyId, JobOfferLineage? lineage)
    {
        if (lineage is null)
            return;
        locks.Add($"Recruitment:Applications:{tenantId}:{companyId}:{lineage.ApplicationId}");
        if (lineage.OpeningId is > 0)
            locks.Add($"Recruitment:Openings:{tenantId}:{companyId}:{lineage.OpeningId.Value}");
        if (lineage.RequisitionId is > 0)
            locks.Add($"Recruitment:Requisitions:{tenantId}:{companyId}:{lineage.RequisitionId.Value}");
        AddPlanning(locks, tenantId, companyId, lineage);
    }
}

internal static class OfferResult
{
    public static async Task<Result<JobOfferDto>> ToDtoAsync(
        Result<int> result,
        IJobOfferReadStore readStore,
        CancellationToken cancellationToken)
    {
        if (result.IsFailure)
            return Result.Failure<JobOfferDto>(result.Error);
        return Result.Success(await CreateJobOfferCommandHandler.RequireReadAsync(readStore, result.Value, cancellationToken));
    }
}
