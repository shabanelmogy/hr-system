using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Abstractions;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Queries;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using MediatR;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Commands;

public sealed record CreateCandidateCommand(CandidateMutation Mutation)
    : ICommand<Result<CandidateDto>>;

public sealed record UpdateCandidateCommand(int Id, CandidateMutation Mutation)
    : ICommand<Result<CandidateDto>>;

public sealed class CreateCandidateCommandHandler(
    ICandidateRepository repository,
    ICandidateReadStore readStore)
    : ICommandHandler<CreateCandidateCommand, Result<CandidateDto>>
{
    public async Task<Result<CandidateDto>> Handle(
        CreateCandidateCommand command,
        CancellationToken cancellationToken)
    {
        var mutation = command.Mutation;
        var normalizedEmail = mutation.Email.Trim().ToLowerInvariant();
        if (await readStore.EmailExistsAsync(normalizedEmail, null, cancellationToken))
            return Result.Failure<CandidateDto>(RecruitmentErrors.CandidateEmailAlreadyExists);

        var candidate = new Candidate(
            mutation.FirstName,
            mutation.LastName,
            mutation.Email,
            mutation.PhoneNumber);
        Apply(candidate, mutation);

        repository.Add(candidate);
        await repository.SaveChangesAsync(cancellationToken);

        var response = await readStore.GetByIdAsync(candidate.Id, cancellationToken)
            ?? throw new InvalidOperationException("The newly created candidate could not be read.");
        return Result.Success(response);
    }

    internal static void Apply(Candidate candidate, CandidateMutation mutation)
    {
        candidate.UpdateIdentity(
            mutation.FirstName,
            mutation.MiddleName,
            mutation.LastName,
            mutation.DateOfBirth,
            mutation.NationalityCountryId);
        candidate.UpdateContact(mutation.Email, mutation.PhoneNumber);
        candidate.UpdateLocation(mutation.CurrentCountryId, mutation.CurrentStateId, mutation.City);
        candidate.UpdateProfessionalProfile(
            mutation.LinkedInUrl,
            mutation.PortfolioUrl,
            mutation.ResumeFileId);
    }
}

public sealed class UpdateCandidateCommandHandler(
    ICandidateRepository repository,
    ICandidateReadStore readStore)
    : ICommandHandler<UpdateCandidateCommand, Result<CandidateDto>>
{
    public async Task<Result<CandidateDto>> Handle(
        UpdateCandidateCommand command,
        CancellationToken cancellationToken)
    {
        var candidate = await repository.GetForUpdateAsync(command.Id, cancellationToken);
        if (candidate is null)
            return Result.Failure<CandidateDto>(RecruitmentErrors.CandidateNotFound);

        var normalizedEmail = command.Mutation.Email.Trim().ToLowerInvariant();
        if (await readStore.EmailExistsAsync(normalizedEmail, command.Id, cancellationToken))
            return Result.Failure<CandidateDto>(RecruitmentErrors.CandidateEmailAlreadyExists);

        CreateCandidateCommandHandler.Apply(candidate, command.Mutation);
        await repository.SaveChangesAsync(cancellationToken);

        var response = await readStore.GetByIdAsync(candidate.Id, cancellationToken)
            ?? throw new InvalidOperationException("The updated candidate could not be read.");
        return Result.Success(response);
    }
}
