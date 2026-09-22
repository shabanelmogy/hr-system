using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Application.Features.CurrencySnapshots;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using ErpSystem.Modules.HR.Domain.Employees.Enums;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;
using MediatR;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Commands;

public sealed record SubmitEmploymentApplicationCommand(SubmitApplicationMutation Mutation)
    : ICommand<Result<EmploymentApplicationDto>>;

public sealed record MoveEmploymentApplicationStageCommand(
    int Id,
    ApplicationStatusFilter TargetStatus,
    string? Reason)
    : ICommand<Result<EmploymentApplicationDto>>;

public sealed record RejectEmploymentApplicationCommand(int Id, string Reason)
    : ICommand<Result<EmploymentApplicationDto>>;

public sealed record WithdrawEmploymentApplicationCommand(int Id, string Reason)
    : ICommand<Result<EmploymentApplicationDto>>;

public sealed record HireEmploymentApplicationCommand(int Id, HireCandidateMutation Mutation)
    : ICommand<Result<EmploymentApplicationDto>>;

public sealed class SubmitEmploymentApplicationCommandHandler(
    IEmploymentApplicationRepository repository,
    IEmploymentApplicationReadStore readStore,
    ICurrentActor actor,
    IAccountingCurrencyCatalog currencyCatalog,
    TimeProvider clock)
    : ICommandHandler<SubmitEmploymentApplicationCommand, Result<EmploymentApplicationDto>>
{
    public async Task<Result<EmploymentApplicationDto>> Handle(
        SubmitEmploymentApplicationCommand command,
        CancellationToken cancellationToken)
    {
        var mutation = command.Mutation;
        if (!AccountingCurrencySnapshotValidation.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.CompanyContextRequired);
        if (!string.IsNullOrWhiteSpace(mutation.ExpectedSalaryCurrencyCode) &&
            await currencyCatalog.FindActiveByCodeAsync(
                tenantId, companyId, mutation.ExpectedSalaryCurrencyCode, cancellationToken) is null)
        {
            return Result.Failure<EmploymentApplicationDto>(HrCurrencySnapshotErrors.InvalidOrInactive);
        }

        var openingStatus = await repository.GetOpeningStatusAsync(mutation.JobOpeningId, cancellationToken);
        if (!openingStatus.HasValue)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.JobOpeningNotFound);
        if (openingStatus.Value != JobOpeningStatus.Open)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.JobOpeningNotOpen);
        if (!await repository.CandidateExistsAsync(mutation.CandidateId, cancellationToken))
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.CandidateNotFound);

        var now = clock.GetUtcNow();
        var application = new EmploymentApplication(
            mutation.CandidateId,
            mutation.JobOpeningId,
            mutation.Source,
            now,
            mutation.JobPostingId);
        application.UpdateDraft(
            mutation.CoverLetter,
            mutation.ResumeFileId,
            mutation.ExpectedSalary,
            mutation.ExpectedSalaryCurrencyCode,
            mutation.AvailableFrom);
        application.Submit(now);

        repository.Add(application);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await RequireReadAsync(readStore, application.Id, cancellationToken));
    }

    internal static async Task<EmploymentApplicationDto> RequireReadAsync(
        IEmploymentApplicationReadStore readStore,
        int id,
        CancellationToken cancellationToken) =>
        await readStore.GetByIdAsync(id, cancellationToken)
        ?? throw new InvalidOperationException("The persisted employment application could not be read.");
}

public sealed class MoveEmploymentApplicationStageCommandHandler(
    IEmploymentApplicationRepository repository,
    IEmploymentApplicationReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    TimeProvider clock)
    : ICommandHandler<MoveEmploymentApplicationStageCommand, Result<EmploymentApplicationDto>>
{
    public async Task<Result<EmploymentApplicationDto>> Handle(
        MoveEmploymentApplicationStageCommand command,
        CancellationToken cancellationToken)
    {
        var actorId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorId is not > 0)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.ActorEmployeeRequired);

        var application = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (application is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.EmploymentApplicationNotFound);

        var now = clock.GetUtcNow();
        switch ((ApplicationStatus)(int)command.TargetStatus)
        {
            case ApplicationStatus.UnderReview:
                application.BeginReview(now, actorId.Value);
                break;
            case ApplicationStatus.Shortlisted:
                application.Shortlist(now, actorId.Value, command.Reason);
                break;
            case ApplicationStatus.InterviewScheduled:
                application.ScheduleInterview(now, actorId.Value);
                break;
            case ApplicationStatus.Interviewed:
                application.RecordInterviewCompleted(now, actorId.Value);
                break;
            case ApplicationStatus.OfferIssued:
                application.RecordOfferIssued(now, actorId.Value);
                break;
            case ApplicationStatus.OfferAccepted:
                application.RecordOfferAccepted(now);
                break;
            case ApplicationStatus.OfferDeclined:
                application.RecordOfferDeclined(command.Reason ?? "Declined", now);
                break;
            case ApplicationStatus.Rejected:
                application.Reject(command.Reason ?? "Rejected", now, actorId.Value);
                break;
            case ApplicationStatus.Withdrawn:
                application.Withdraw(command.Reason ?? "Withdrawn", now);
                break;
            default:
                return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.InvalidOperation);
        }

        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await SubmitEmploymentApplicationCommandHandler.RequireReadAsync(
            readStore, application.Id, cancellationToken));
    }
}

public sealed class RejectEmploymentApplicationCommandHandler(
    ISender sender)
    : ICommandHandler<RejectEmploymentApplicationCommand, Result<EmploymentApplicationDto>>
{
    public Task<Result<EmploymentApplicationDto>> Handle(
        RejectEmploymentApplicationCommand command,
        CancellationToken cancellationToken) =>
        sender.Send(
            new MoveEmploymentApplicationStageCommand(command.Id, ApplicationStatusFilter.Rejected, command.Reason),
            cancellationToken);
}

public sealed class WithdrawEmploymentApplicationCommandHandler(
    ISender sender)
    : ICommandHandler<WithdrawEmploymentApplicationCommand, Result<EmploymentApplicationDto>>
{
    public Task<Result<EmploymentApplicationDto>> Handle(
        WithdrawEmploymentApplicationCommand command,
        CancellationToken cancellationToken) =>
        sender.Send(
            new MoveEmploymentApplicationStageCommand(command.Id, ApplicationStatusFilter.Withdrawn, command.Reason),
            cancellationToken);
}

public sealed class HireEmploymentApplicationCommandHandler(
    IRecruitmentHireRepository hireRepository,
    IEmploymentApplicationReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    IUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider clock)
    : ICommandHandler<HireEmploymentApplicationCommand, Result<EmploymentApplicationDto>>
{
    public async Task<Result<EmploymentApplicationDto>> Handle(
        HireEmploymentApplicationCommand command,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.CompanyContextRequired);

        var tenantId = actor.TenantId;
        var companyId = actor.CompanyId.Value;
        var mutation = command.Mutation;
        var idempotencyKey = mutation.IdempotencyKey?.Trim();
        if (idempotencyKey?.Length > 128)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.InvalidOperation);

        var employeeNumberHint = string.IsNullOrWhiteSpace(mutation.EmployeeNumber)
            ? string.Empty
            : mutation.EmployeeNumber.Trim().ToUpperInvariant();

        var applicationStatus = await hireRepository.GetApplicationStatusAsync(command.Id, cancellationToken);
        if (!applicationStatus.HasValue)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.EmploymentApplicationNotFound);
        if (applicationStatus.Value == ApplicationStatus.Hired)
            return Result.Success(await SubmitEmploymentApplicationCommandHandler.RequireReadAsync(
                readStore, command.Id, cancellationToken));
        if (applicationStatus.Value != ApplicationStatus.OfferAccepted)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.AcceptedOfferRequired);

        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.ActorEmployeeRequired);

        var locks = new List<string>
        {
            $"Recruitment:Hires:{tenantId}:{companyId}",
            WorkforcePlanLocks.Company(tenantId, companyId),
            $"Recruitment:Applications:{tenantId}:{companyId}:{command.Id}",
            $"Recruitment:Idempotency:{tenantId}:{companyId}:{idempotencyKey ?? "none"}",
            $"Recruitment:Employees:Number:{tenantId}:{companyId}:{employeeNumberHint}",
        };

        var lineage = await hireRepository.GetLineageAsync(command.Id, cancellationToken);
        if (lineage is not null)
        {
            if (lineage.OfferId is > 0)
                locks.Add($"Recruitment:Offers:{tenantId}:{companyId}:{lineage.OfferId.Value}");
            if (lineage.OpeningId is > 0)
                locks.Add($"Recruitment:Openings:{tenantId}:{companyId}:{lineage.OpeningId.Value}");
            if (lineage.RequisitionId is > 0)
                locks.Add($"Recruitment:Requisitions:{tenantId}:{companyId}:{lineage.RequisitionId.Value}");
            if (lineage.StaffingRequestId is > 0)
                locks.Add($"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{lineage.StaffingRequestId.Value}");
            if (lineage.EnvelopeId is > 0)
                locks.Add($"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{lineage.EnvelopeId.Value}");
        }

        var now = clock.GetUtcNow();
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            locks,
            async token =>
            {
                if (!string.IsNullOrWhiteSpace(idempotencyKey))
                {
                    var replay = await hireRepository.FindByHireIdempotencyKeyAsync(idempotencyKey, token);
                    if (replay is not null)
                    {
                        if (replay.Id != command.Id)
                            return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                        if (replay.EmployeeId is > 0)
                            return Result.Success(replay.Id);
                    }
                }

                var app = await hireRepository.GetApplicationForUpdateAsync(command.Id, token);
                if (app is null)
                    return Result.Failure<int>(RecruitmentErrors.EmploymentApplicationNotFound);
                if (app.Status == ApplicationStatus.Hired)
                    return Result.Success(app.Id);
                if (app.Status != ApplicationStatus.OfferAccepted)
                    return Result.Failure<int>(RecruitmentErrors.AcceptedOfferRequired);

                var acceptedOffer = await hireRepository.GetAcceptedOfferAsync(app.Id, token);
                if (acceptedOffer is null)
                    return Result.Failure<int>(RecruitmentErrors.AcceptedOfferRequired);
                var candidate = await hireRepository.GetCandidateAsync(app.CandidateId, token);
                if (candidate is null)
                    return Result.Failure<int>(RecruitmentErrors.CandidateNotFound);
                var opening = await hireRepository.GetOpeningAsync(app.JobOpeningId, token);
                if (opening is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOpeningNotFound);
                if (opening.Status is not (JobOpeningStatus.Open or JobOpeningStatus.Paused) || opening.AvailablePositions <= 0)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                var requisition = await hireRepository.GetRequisitionAsync(opening.JobRequisitionId, token);
                if (requisition is null)
                    return Result.Failure<int>(RecruitmentErrors.JobRequisitionNotFound);
                if (requisition.Status != JobRequisitionStatus.Approved || requisition.ReleasablePositions <= 0)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                StaffingRequest? staffingRequest = null;
                PositionEnvelope? envelope = null;
                if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                {
                    staffingRequest = await hireRepository.GetStaffingRequestAsync(requisition.StaffingRequestId.Value, token);
                    if (staffingRequest is null ||
                        !string.Equals(staffingRequest.CurrencyCode, acceptedOffer.CurrencyCode, StringComparison.OrdinalIgnoreCase))
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    envelope = await hireRepository.GetEnvelopeAsync(staffingRequest.EnvelopeId, token);
                    if (envelope is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }

                var hireDate = mutation.HireDate != default ? mutation.HireDate : acceptedOffer.ProposedStartDate;
                var employeeNumber = employeeNumberHint.Length > 0
                    ? employeeNumberHint
                    : $"EMP-{hireDate.Year}{hireDate.Month:D2}-{candidate.Id:D4}";

                var existingEmployee = await hireRepository.GetEmployeeByNumberAsync(employeeNumber, token);
                if (existingEmployee is not null && existingEmployee.Id != app.EmployeeId)
                    return Result.Failure<int>(RecruitmentErrors.EmployeeNumberAlreadyExists);

                var fiscalCost = acceptedOffer.FiscalYearCostSnapshot;
                if (envelope is not null)
                {
                    if (envelope.ReservedHeadcount < 1 || envelope.ReservedSalaryBudget < fiscalCost)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    if (staffingRequest is not null && staffingRequest.RemainingToHire < 1)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }

                var employee = new Employee(employeeNumber, candidate.FirstName, candidate.LastName, hireDate, candidate.Id);
                // The application-to-employee relationship uses the tenant/company
                // alternate key. Assign the already-validated command scope before
                // connecting the pending employee so EF relationship fix-up cannot
                // attempt to rewrite the existing application's identifying keys.
                employee.TenantId = tenantId;
                employee.CompanyId = companyId;
                employee.Activate(hireDate);
                employee.Assignments.Add(EmployeeAssignment.ForPendingEmployee(
                    opening.PositionId,
                    opening.BranchId,
                    opening.DepartmentId,
                    hireDate,
                    true,
                    opening.DivisionId));
                var contractType = acceptedOffer.EmploymentType == EmploymentType.PartTime
                    ? EmployeeContractType.Temporary
                    : EmployeeContractType.Permanent;
                var contract = EmployeeContract.ForPendingEmployee($"CON-{employeeNumber}", contractType, hireDate, null);
                contract.Activate(hireDate);
                employee.Contracts.Add(contract);
                hireRepository.AddEmployee(employee);

                try
                {
                    if (envelope is not null)
                    {
                        envelope.ConsumeReserved(1, fiscalCost);
                        if (acceptedOffer.ReservationDelta < 0)
                            envelope.AdjustReservedSalary(acceptedOffer.ReservationDelta);
                    }
                    staffingRequest?.RegisterHire(1);
                    requisition.RegisterHire();
                    opening.RegisterHire(now);
                    app.MarkHiredForPendingEmployee(employee, now, actorEmployeeId.Value, idempotencyKey);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }

                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(app.Id);
            },
            cancellationToken);

        if (result.IsFailure)
            return Result.Failure<EmploymentApplicationDto>(result.Error);
        return Result.Success(await SubmitEmploymentApplicationCommandHandler.RequireReadAsync(
            readStore, result.Value, cancellationToken));
    }
}
