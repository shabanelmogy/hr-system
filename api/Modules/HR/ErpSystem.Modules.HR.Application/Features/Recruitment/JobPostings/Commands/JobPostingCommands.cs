using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Commands;

public sealed record CreateJobPostingCommand(JobPostingMutation Mutation)
    : ICommand<Result<JobPostingDto>>;

public sealed record UpdateJobPostingCommand(int Id, JobPostingMutation Mutation)
    : ICommand<Result<JobPostingDto>>;

public sealed record PublishJobPostingCommand(int Id)
    : ICommand<Result<JobPostingDto>>;

public sealed record CloseJobPostingCommand(int Id)
    : ICommand<Result<JobPostingDto>>;

public sealed class CreateJobPostingCommandHandler(
    IJobPostingRepository repository,
    IJobPostingReadStore readStore)
    : ICommandHandler<CreateJobPostingCommand, Result<JobPostingDto>>
{
    public async Task<Result<JobPostingDto>> Handle(
        CreateJobPostingCommand command,
        CancellationToken cancellationToken)
    {
        var mutation = command.Mutation;
        var normalizedSlug = mutation.Slug.Trim().ToLowerInvariant();
        if (await repository.SlugExistsAsync(normalizedSlug, cancellationToken))
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingSlugAlreadyExists);
        if (!await repository.JobOpeningExistsAsync(mutation.JobOpeningId, cancellationToken))
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobOpeningNotFound);

        var posting = new JobPosting(
            mutation.JobOpeningId,
            normalizedSlug,
            mutation.Audience,
            mutation.TitleEn,
            mutation.TitleAr);
        ApplyContent(posting, mutation);

        if (mutation.ScheduledPublishOn.HasValue)
            posting.Schedule(mutation.ScheduledPublishOn.Value, mutation.ClosesOn);

        repository.Add(posting);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await RequireReadAsync(readStore, posting.Id, cancellationToken));
    }

    internal static void ApplyContent(JobPosting posting, JobPostingMutation mutation) =>
        posting.UpdateContent(
            mutation.TitleEn,
            mutation.TitleAr,
            mutation.DescriptionEn,
            mutation.DescriptionAr,
            mutation.ResponsibilitiesEn,
            mutation.ResponsibilitiesAr,
            mutation.RequirementsEn,
            mutation.RequirementsAr,
            mutation.LocationTextEn,
            mutation.LocationTextAr,
            mutation.Audience);

    internal static async Task<JobPostingDto> RequireReadAsync(
        IJobPostingReadStore readStore,
        int id,
        CancellationToken cancellationToken) =>
        await readStore.GetByIdAsync(id, cancellationToken)
        ?? throw new InvalidOperationException("The persisted job posting could not be read.");
}

public sealed class UpdateJobPostingCommandHandler(
    IJobPostingRepository repository,
    IJobPostingReadStore readStore)
    : ICommandHandler<UpdateJobPostingCommand, Result<JobPostingDto>>
{
    public async Task<Result<JobPostingDto>> Handle(
        UpdateJobPostingCommand command,
        CancellationToken cancellationToken)
    {
        var posting = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (posting is null)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);

        CreateJobPostingCommandHandler.ApplyContent(posting, command.Mutation);
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobPostingCommandHandler.RequireReadAsync(
            readStore, posting.Id, cancellationToken));
    }
}

public sealed class PublishJobPostingCommandHandler(
    IJobPostingRepository repository,
    IJobPostingReadStore readStore,
    TimeProvider clock)
    : ICommandHandler<PublishJobPostingCommand, Result<JobPostingDto>>
{
    public async Task<Result<JobPostingDto>> Handle(
        PublishJobPostingCommand command,
        CancellationToken cancellationToken)
    {
        var posting = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (posting is null)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);

        posting.Publish(clock.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobPostingCommandHandler.RequireReadAsync(
            readStore, posting.Id, cancellationToken));
    }
}

public sealed class CloseJobPostingCommandHandler(
    IJobPostingRepository repository,
    IJobPostingReadStore readStore,
    TimeProvider clock)
    : ICommandHandler<CloseJobPostingCommand, Result<JobPostingDto>>
{
    public async Task<Result<JobPostingDto>> Handle(
        CloseJobPostingCommand command,
        CancellationToken cancellationToken)
    {
        var posting = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (posting is null)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);

        posting.Close(clock.GetUtcNow());
        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await CreateJobPostingCommandHandler.RequireReadAsync(
            readStore, posting.Id, cancellationToken));
    }
}
