using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Contracts;
using ErpSystem.Modules.HR.Application.Features.CurrencySnapshots;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings.Abstractions;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Settings;

public sealed record UpdateRecruitmentSettingsCommand(RecruitmentSettingsDto Settings)
    : ICommand<Result<RecruitmentSettingsDto>>;

public sealed class UpdateRecruitmentSettingsCommandHandler(
    IRecruitmentSettingsRepository repository,
    IRecruitmentSettingsReadStore readStore,
    ICurrentActor actor,
    IAccountingCurrencyCatalog currencyCatalog)
    : ICommandHandler<UpdateRecruitmentSettingsCommand, Result<RecruitmentSettingsDto>>
{
    public async Task<Result<RecruitmentSettingsDto>> Handle(
        UpdateRecruitmentSettingsCommand command,
        CancellationToken cancellationToken)
    {
        var settings = command.Settings;
        if (!AccountingCurrencySnapshotValidation.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<RecruitmentSettingsDto>(RecruitmentErrors.CompanyContextRequired);
        if (await currencyCatalog.FindActiveByCodeAsync(
                tenantId, companyId, settings.General.DefaultCurrency, cancellationToken) is null)
            return Result.Failure<RecruitmentSettingsDto>(HrCurrencySnapshotErrors.InvalidOrInactive);

        await GetRecruitmentSettingsQueryHandler.EnsureSeededAsync(repository, cancellationToken);

        var stages = await repository.GetStagesAsync(cancellationToken);
        foreach (var dto in settings.Stages)
        {
            var existing = stages.FirstOrDefault(stage => stage.Code == dto.Id);
            if (existing is not null)
            {
                existing.Update(dto.NameAr, dto.NameEn, dto.Sequence, dto.Color,
                    dto.FoldedInKanban, dto.IsDefault, dto.SendEmailNotification,
                    dto.MappedStatus, dto.EmailTemplate);
            }
            else
            {
                repository.AddStage(new RecruitmentStage(
                    dto.Id, dto.NameAr, dto.NameEn, dto.Sequence, dto.Color,
                    dto.FoldedInKanban, dto.IsDefault, dto.SendEmailNotification,
                    dto.MappedStatus, dto.EmailTemplate));
            }
        }

        var reasons = await repository.GetRejectionReasonsAsync(cancellationToken);
        foreach (var dto in settings.RejectionReasons)
        {
            var existing = reasons.FirstOrDefault(reason => reason.Code == dto.Id);
            if (existing is not null)
            {
                existing.Update(dto.ReasonAr, dto.ReasonEn, dto.Category, dto.SendAutoEmail,
                    dto.EmailSubjectAr, dto.EmailSubjectEn, dto.EmailBodyAr, dto.EmailBodyEn);
            }
            else
            {
                repository.AddRejectionReason(new RejectionReason(
                    dto.Id, dto.ReasonAr, dto.ReasonEn, dto.Category, dto.SendAutoEmail,
                    dto.EmailSubjectAr, dto.EmailSubjectEn, dto.EmailBodyAr, dto.EmailBodyEn));
            }
        }

        var sources = await repository.GetSourcesAsync(cancellationToken);
        foreach (var dto in settings.Sources)
        {
            var existing = sources.FirstOrDefault(source => source.Code == dto.Id);
            if (existing is not null)
                existing.Update(dto.NameAr, dto.NameEn, dto.Type, dto.IsActive);
            else
                repository.AddSource(new RecruitmentSource(
                    dto.Id, dto.NameAr, dto.NameEn, dto.Type, dto.IsActive,
                    dto.ApplicationsCount, dto.HiredCount));
        }

        var criteria = await repository.GetEvaluationCriteriaAsync(cancellationToken);
        foreach (var dto in settings.EvaluationCriteria)
        {
            var existing = criteria.FirstOrDefault(criterion => criterion.Code == dto.Id);
            if (existing is not null)
            {
                existing.Update(dto.TitleAr, dto.TitleEn, dto.Category, dto.MaxScore,
                    dto.Weight, dto.IsMandatory, dto.DescriptionAr, dto.DescriptionEn);
            }
            else
            {
                repository.AddEvaluationCriterion(new EvaluationCriterion(
                    dto.Id, dto.TitleAr, dto.TitleEn, dto.Category, dto.MaxScore,
                    dto.Weight, dto.IsMandatory, dto.DescriptionAr, dto.DescriptionEn));
            }
        }

        var policy = await repository.GetPolicyAsync(cancellationToken);
        if (policy is null)
        {
            repository.AddPolicy(new RecruitmentPolicy(
                settings.General.DefaultCurrency,
                settings.General.OfferExpiryDays,
                settings.General.AutoPublishOpening,
                settings.General.EnforceHeadcountCapacity,
                settings.General.DefaultProbationMonths,
                settings.General.EnablePublicPortal,
                settings.General.InboundEmailAlias));
        }
        else
        {
            policy.Update(
                settings.General.DefaultCurrency,
                settings.General.OfferExpiryDays,
                settings.General.AutoPublishOpening,
                settings.General.EnforceHeadcountCapacity,
                settings.General.DefaultProbationMonths,
                settings.General.EnablePublicPortal,
                settings.General.InboundEmailAlias);
        }

        await repository.SaveChangesAsync(cancellationToken);
        return Result.Success(await readStore.GetAsync(cancellationToken));
    }
}
