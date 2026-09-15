using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Commands;

public sealed record CreateJobOpeningCommand(JobOpeningMutation Mutation)
    : ICommand<Result<JobOpeningDto>>;

public sealed record OpenJobOpeningCommand(int Id)
    : ICommand<Result<JobOpeningDto>>;

public sealed record PauseJobOpeningCommand(int Id, string Reason)
    : ICommand<Result<JobOpeningDto>>;

public sealed record CloseJobOpeningCommand(int Id, string Reason)
    : ICommand<Result<JobOpeningDto>>;

public sealed class CreateJobOpeningCommandHandler(
    IJobOpeningRepository repository,
    IJobOpeningReadStore readStore,
    TimeProvider clock)
    : ICommandHandler<CreateJobOpeningCommand, Result<JobOpeningDto>>
{
    public async Task<Result<JobOpeningDto>> Handle(
        CreateJobOpeningCommand command,
        CancellationToken cancellationToken)
    {
        var mutation = command.Mutation;
        var requisitionStatus = await repository.GetRequisitionStatusAsync(
            mutation.JobRequisitionId,
            cancellationToken);

        if (!requisitionStatus.HasValue)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobRequisitionNotFound);
        if (requisitionStatus.Value != JobRequisitionStatus.Approved)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobRequisitionNotApproved);

        var openingNumber = $"JOB-{clock.GetUtcNow():yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpperInvariant()}";
        var opening = new JobOpening(
            openingNumber,
            mutation.JobRequisitionId,
            mutation.PositionId,
            mutation.BranchId,
            mutation.DepartmentId,
            mutation.PositionCount,
            mutation.EmploymentType,
            mutation.WorkArrangement,
            mutation.DivisionId);

        repository.Add(opening);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await RequireReadAsync(readStore, opening.Id, cancellationToken));
    }

    internal static async Task<JobOpeningDto> RequireReadAsync(
        IJobOpeningReadStore readStore,
        int id,
        CancellationToken cancellationToken) =>
        await readStore.GetByIdAsync(id, cancellationToken)
        ?? throw new InvalidOperationException("The persisted job opening could not be read.");
}

public sealed class OpenJobOpeningCommandHandler(
    IJobOpeningRepository repository,
    IJobOpeningReadStore readStore,
    TimeProvider clock)
    : ICommandHandler<OpenJobOpeningCommand, Result<JobOpeningDto>>
{
    public async Task<Result<JobOpeningDto>> Handle(
        OpenJobOpeningCommand command,
        CancellationToken cancellationToken)
    {
        var opening = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (opening is null)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);

        opening.Open(clock.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobOpeningCommandHandler.RequireReadAsync(
            readStore, opening.Id, cancellationToken));
    }
}

public sealed class PauseJobOpeningCommandHandler(
    IJobOpeningRepository repository,
    IJobOpeningReadStore readStore)
    : ICommandHandler<PauseJobOpeningCommand, Result<JobOpeningDto>>
{
    public async Task<Result<JobOpeningDto>> Handle(
        PauseJobOpeningCommand command,
        CancellationToken cancellationToken)
    {
        var opening = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (opening is null)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);

        opening.Pause(command.Reason);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobOpeningCommandHandler.RequireReadAsync(
            readStore, opening.Id, cancellationToken));
    }
}

public sealed class CloseJobOpeningCommandHandler(
    IJobOpeningRepository repository,
    IJobOpeningReadStore readStore,
    TimeProvider clock)
    : ICommandHandler<CloseJobOpeningCommand, Result<JobOpeningDto>>
{
    public async Task<Result<JobOpeningDto>> Handle(
        CloseJobOpeningCommand command,
        CancellationToken cancellationToken)
    {
        var opening = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (opening is null)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);

        opening.Close(command.Reason, clock.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobOpeningCommandHandler.RequireReadAsync(
            readStore, opening.Id, cancellationToken));
    }
}
