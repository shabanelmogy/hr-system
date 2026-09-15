using System.Text.Json;
using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Commands;

public sealed record ScheduleInterviewCommand(ScheduleInterviewMutation Mutation)
    : ICommand<Result<InterviewDto>>;
public sealed record CancelInterviewCommand(int Id, string Reason)
    : ICommand<Result<InterviewDto>>;
public sealed record CompleteInterviewCommand(int Id)
    : ICommand<Result<InterviewDto>>;
public sealed record SubmitInterviewEvaluationCommand(
    int InterviewId,
    SubmitInterviewEvaluationMutation Mutation) : ICommand<Result<InterviewDto>>;

public sealed class ScheduleInterviewCommandHandler(
    IInterviewRepository repository,
    IInterviewReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    TimeProvider clock)
    : ICommandHandler<ScheduleInterviewCommand, Result<InterviewDto>>
{
    public async Task<Result<InterviewDto>> Handle(
        ScheduleInterviewCommand command,
        CancellationToken cancellationToken)
    {
        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<InterviewDto>(RecruitmentErrors.ActorEmployeeRequired);

        var mutation = command.Mutation;
        var application = await repository.GetApplicationForUpdateAsync(
            mutation.EmploymentApplicationId,
            cancellationToken);
        if (application is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.EmploymentApplicationNotFound);

        var leadId = mutation.LeadEmployeeId ?? actorEmployeeId.Value;
        var participantIds = (mutation.ParticipantEmployeeIds ?? [])
            .Append(leadId)
            .Distinct()
            .ToArray();
        if (!await repository.AreEmployeesValidAsync(participantIds, cancellationToken))
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewParticipantNotFound);

        var interview = new Interview(
            mutation.EmploymentApplicationId,
            mutation.Type,
            mutation.StartsOn,
            mutation.EndsOn,
            mutation.LocationOrMeetingUrl);
        interview.AddInterviewer(leadId, isLead: true);
        foreach (var participantId in participantIds.Where(id => id != leadId))
            interview.AddInterviewer(participantId);

        if (application.Status == ApplicationStatus.Shortlisted)
            application.ScheduleInterview(clock.GetUtcNow(), actorEmployeeId.Value);

        repository.Add(interview);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await RequireReadAsync(readStore, interview.Id, cancellationToken));
    }

    internal static async Task<InterviewDto> RequireReadAsync(
        IInterviewReadStore readStore,
        int id,
        CancellationToken cancellationToken) =>
        await readStore.GetByIdAsync(id, cancellationToken)
        ?? throw new InvalidOperationException("The persisted interview could not be read.");
}

public sealed class CancelInterviewCommandHandler(
    IInterviewRepository repository,
    IInterviewReadStore readStore)
    : ICommandHandler<CancelInterviewCommand, Result<InterviewDto>>
{
    public async Task<Result<InterviewDto>> Handle(
        CancelInterviewCommand command,
        CancellationToken cancellationToken)
    {
        var interview = await repository.GetForUpdateAsync(command.Id, false, cancellationToken);
        if (interview is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);

        interview.Cancel(command.Reason);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await ScheduleInterviewCommandHandler.RequireReadAsync(
            readStore, interview.Id, cancellationToken));
    }
}

public sealed class CompleteInterviewCommandHandler(
    IInterviewRepository repository,
    IInterviewReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    TimeProvider clock)
    : ICommandHandler<CompleteInterviewCommand, Result<InterviewDto>>
{
    public async Task<Result<InterviewDto>> Handle(
        CompleteInterviewCommand command,
        CancellationToken cancellationToken)
    {
        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<InterviewDto>(RecruitmentErrors.ActorEmployeeRequired);

        var interview = await repository.GetForUpdateAsync(command.Id, false, cancellationToken);
        if (interview is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);

        var now = clock.GetUtcNow();
        interview.Complete(now);
        var application = await repository.GetApplicationForUpdateAsync(
            interview.EmploymentApplicationId,
            cancellationToken);
        if (application is not null && application.Status == ApplicationStatus.InterviewScheduled)
            application.RecordInterviewCompleted(now, actorEmployeeId.Value);

        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await ScheduleInterviewCommandHandler.RequireReadAsync(
            readStore, interview.Id, cancellationToken));
    }
}

public sealed class SubmitInterviewEvaluationCommandHandler(
    IInterviewRepository repository,
    IInterviewReadStore readStore,
    IRecruitmentActorEmployeeSource actorEmployees,
    TimeProvider clock)
    : ICommandHandler<SubmitInterviewEvaluationCommand, Result<InterviewDto>>
{
    public async Task<Result<InterviewDto>> Handle(
        SubmitInterviewEvaluationCommand command,
        CancellationToken cancellationToken)
    {
        var actorEmployeeId = await actorEmployees.GetCurrentEmployeeIdAsync(cancellationToken);
        if (actorEmployeeId is not > 0)
            return Result.Failure<InterviewDto>(RecruitmentErrors.ActorEmployeeRequired);

        var interview = await repository.GetForUpdateAsync(
            command.InterviewId,
            includeEvaluations: true,
            cancellationToken);
        if (interview is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);
        if (interview.Participants.All(participant => participant.EmployeeId != actorEmployeeId.Value))
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewEvaluatorNotAssigned);

        var mutation = command.Mutation;
        var skills = mutation.SkillEvaluations?.ToList() ?? [];
        var finalScore = mutation.Score;
        string? skillsJson = null;
        if (skills.Count > 0)
        {
            skillsJson = JsonSerializer.Serialize(skills);
            if (finalScore <= 0)
            {
                var totalWeight = skills.Sum(skill => skill.WeightPercentage ?? 1);
                if (totalWeight > 0)
                {
                    var weightedSum = skills.Sum(skill =>
                        (decimal)skill.Score * (skill.WeightPercentage ?? 1));
                    finalScore = Math.Round(weightedSum / totalWeight, 2);
                }
            }
        }

        interview.SubmitEvaluation(
            actorEmployeeId.Value,
            finalScore,
            mutation.Recommendation,
            mutation.Comments,
            clock.GetUtcNow(),
            skillsJson);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await ScheduleInterviewCommandHandler.RequireReadAsync(
            readStore, interview.Id, cancellationToken));
    }
}
