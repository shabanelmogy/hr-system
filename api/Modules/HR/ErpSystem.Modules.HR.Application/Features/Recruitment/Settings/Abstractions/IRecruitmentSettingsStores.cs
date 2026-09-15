using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Settings.Abstractions;

public interface IRecruitmentSettingsReadStore
{
    Task<RecruitmentSettingsDto> GetAsync(CancellationToken cancellationToken);
}

public interface IRecruitmentSettingsRepository
{
    Task<bool> HasStagesAsync(CancellationToken cancellationToken);
    Task<List<RecruitmentStage>> GetStagesAsync(CancellationToken cancellationToken);
    Task<List<RejectionReason>> GetRejectionReasonsAsync(CancellationToken cancellationToken);
    Task<List<RecruitmentSource>> GetSourcesAsync(CancellationToken cancellationToken);
    Task<List<EvaluationCriterion>> GetEvaluationCriteriaAsync(CancellationToken cancellationToken);
    Task<RecruitmentPolicy?> GetPolicyAsync(CancellationToken cancellationToken);

    void AddStage(RecruitmentStage stage);
    void AddRejectionReason(RejectionReason reason);
    void AddSource(RecruitmentSource source);
    void AddEvaluationCriterion(EvaluationCriterion criterion);
    void AddPolicy(RecruitmentPolicy policy);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
