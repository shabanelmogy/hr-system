using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Settings.Persistence;

public sealed class RecruitmentSettingsReadStore(ApplicationDbContext context)
    : IRecruitmentSettingsReadStore
{
    public async Task<RecruitmentSettingsDto> GetAsync(CancellationToken cancellationToken)
    {
        var stages = await context.RecruitmentStages.AsNoTracking()
            .OrderBy(stage => stage.Sequence)
            .Select(stage => new RecruitmentStageDto(
                stage.Code,
                stage.NameAr,
                stage.NameEn,
                stage.Sequence,
                stage.Color,
                stage.FoldedInKanban,
                stage.IsDefault,
                stage.SendEmailNotification,
                stage.MappedStatus,
                stage.EmailTemplate))
            .ToListAsync(cancellationToken);

        var reasons = await context.RecruitmentRejectionReasons.AsNoTracking()
            .Select(reason => new RejectionReasonDto(
                reason.Code,
                reason.ReasonAr,
                reason.ReasonEn,
                reason.Category,
                reason.SendAutoEmail,
                reason.EmailSubjectAr,
                reason.EmailSubjectEn,
                reason.EmailBodyAr,
                reason.EmailBodyEn))
            .ToListAsync(cancellationToken);

        var sources = await context.RecruitmentSources.AsNoTracking()
            .Select(source => new RecruitmentSourceDto(
                source.Code,
                source.NameAr,
                source.NameEn,
                source.Type,
                source.IsActive,
                source.ApplicationsCount,
                source.HiredCount))
            .ToListAsync(cancellationToken);

        var criteria = await context.RecruitmentEvaluationCriteria.AsNoTracking()
            .Select(criterion => new EvaluationCriterionDto(
                criterion.Code,
                criterion.TitleAr,
                criterion.TitleEn,
                criterion.Category,
                criterion.MaxScore,
                criterion.Weight,
                criterion.IsMandatory,
                criterion.DescriptionAr,
                criterion.DescriptionEn))
            .ToListAsync(cancellationToken);

        var policy = await context.RecruitmentPolicies.AsNoTracking()
            .Select(item => new RecruitmentGeneralSettingsDto
            {
                DefaultCurrency = item.DefaultCurrency,
                OfferExpiryDays = item.OfferExpiryDays,
                AutoPublishOpening = item.AutoPublishOpening,
                EnforceHeadcountCapacity = item.EnforceHeadcountCapacity,
                DefaultProbationMonths = item.DefaultProbationMonths,
                EnablePublicPortal = item.EnablePublicPortal,
                InboundEmailAlias = item.InboundEmailAlias
            })
            .FirstOrDefaultAsync(cancellationToken);

        return new RecruitmentSettingsDto
        {
            Stages = stages,
            RejectionReasons = reasons,
            Sources = sources,
            EvaluationCriteria = criteria,
            General = policy ?? new RecruitmentGeneralSettingsDto()
        };
    }
}

public sealed class RecruitmentSettingsRepository(ApplicationDbContext context)
    : IRecruitmentSettingsRepository
{
    public Task<bool> HasStagesAsync(CancellationToken cancellationToken) =>
        context.RecruitmentStages.AnyAsync(cancellationToken);

    public Task<List<RecruitmentStage>> GetStagesAsync(CancellationToken cancellationToken) =>
        context.RecruitmentStages.ToListAsync(cancellationToken);

    public Task<List<RejectionReason>> GetRejectionReasonsAsync(CancellationToken cancellationToken) =>
        context.RecruitmentRejectionReasons.ToListAsync(cancellationToken);

    public Task<List<RecruitmentSource>> GetSourcesAsync(CancellationToken cancellationToken) =>
        context.RecruitmentSources.ToListAsync(cancellationToken);

    public Task<List<EvaluationCriterion>> GetEvaluationCriteriaAsync(CancellationToken cancellationToken) =>
        context.RecruitmentEvaluationCriteria.ToListAsync(cancellationToken);

    public Task<RecruitmentPolicy?> GetPolicyAsync(CancellationToken cancellationToken) =>
        context.RecruitmentPolicies.FirstOrDefaultAsync(cancellationToken);

    public void AddStage(RecruitmentStage stage) => context.RecruitmentStages.Add(stage);
    public void AddRejectionReason(RejectionReason reason) => context.RecruitmentRejectionReasons.Add(reason);
    public void AddSource(RecruitmentSource source) => context.RecruitmentSources.Add(source);
    public void AddEvaluationCriterion(EvaluationCriterion criterion) => context.RecruitmentEvaluationCriteria.Add(criterion);
    public void AddPolicy(RecruitmentPolicy policy) => context.RecruitmentPolicies.Add(policy);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
