using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings.Abstractions;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Settings;

public sealed record GetRecruitmentSettingsQuery : IQuery<RecruitmentSettingsDto>;

public sealed class GetRecruitmentSettingsQueryHandler(
    IRecruitmentSettingsRepository repository,
    IRecruitmentSettingsReadStore readStore)
    : IQueryHandler<GetRecruitmentSettingsQuery, RecruitmentSettingsDto>
{
    public async Task<RecruitmentSettingsDto> Handle(
        GetRecruitmentSettingsQuery query,
        CancellationToken cancellationToken)
    {
        await EnsureSeededAsync(repository, cancellationToken);
        return await readStore.GetAsync(cancellationToken);
    }

    internal static async Task EnsureSeededAsync(
        IRecruitmentSettingsRepository repository,
        CancellationToken cancellationToken)
    {
        if (await repository.HasStagesAsync(cancellationToken))
            return;

        foreach (var stage in RecruitmentSettingsDefaults.Stages())
            repository.AddStage(stage);
        foreach (var reason in RecruitmentSettingsDefaults.RejectionReasons())
            repository.AddRejectionReason(reason);
        foreach (var source in RecruitmentSettingsDefaults.Sources())
            repository.AddSource(source);
        foreach (var criterion in RecruitmentSettingsDefaults.EvaluationCriteria())
            repository.AddEvaluationCriterion(criterion);
        repository.AddPolicy(RecruitmentSettingsDefaults.Policy());

        await repository.SaveChangesAsync(cancellationToken);
    }
}
