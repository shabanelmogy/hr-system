using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed record CreateGlobalCrystalReportDraftCommand(
    string ModuleKey, string SourceKey, string ReportKey, string DisplayName,
    string? Description, string ContractFingerprint, string ViewName = "") : ICommand<Result<CrystalReportDetailResponse>>;

public sealed class CreateGlobalCrystalReportDraftCommandValidator : AbstractValidator<CreateGlobalCrystalReportDraftCommand>
{
    public CreateGlobalCrystalReportDraftCommandValidator()
    {
        RuleFor(request => request.ModuleKey).NotEmpty().MaximumLength(64);
        RuleFor(request => request.SourceKey).NotEmpty().MaximumLength(64);
        RuleFor(request => request.ReportKey).NotEmpty().MaximumLength(128)
            .Must(CrystalReportRules.IsValidKey);
        RuleFor(request => request.DisplayName).NotEmpty().MaximumLength(200);
        RuleFor(request => request.Description).MaximumLength(500);
        RuleFor(request => request.ContractFingerprint).NotEmpty().Matches("^[a-f0-9]{64}$");
        RuleFor(request => request.ViewName).NotEmpty().MaximumLength(257)
            .Matches("^[A-Za-z_][A-Za-z0-9_]{0,127}\\.[A-Za-z_][A-Za-z0-9_]{0,127}$");
    }
}

public sealed class CreateGlobalCrystalReportDraftCommandHandler(
    IGlobalCrystalReportStore store, IReportingUnitOfWork unitOfWork,
    GlobalCrystalReportPolicy policy, ICrystalReportDesignSourceCatalog catalog, CrystalReportErrors errors,
    IGlobalCrystalReportViewSource? views = null)
    : ICommandHandler<CreateGlobalCrystalReportDraftCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        CreateGlobalCrystalReportDraftCommand request, CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.SourceKey, ReportingPermissions.CreateGlobalCrystalReports))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        var source = catalog.Sources.FirstOrDefault(item => item.SourceKey == request.SourceKey &&
            item.ModuleKey == request.ModuleKey && item.Scope == "global");
        if (source is null)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportUnsupportedEntity);
        if (source.ContractFingerprint != request.ContractFingerprint)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportContractStale);
        if (!CrystalReportRules.IsValidKey(request.ReportKey) || request.ReportKey.Length > 128 ||
            !CrystalReportRules.MatchesEntityPrefix(request.ReportKey, source.SourceKey) ||
            string.IsNullOrWhiteSpace(request.DisplayName) || request.DisplayName.Length > 200 ||
            request.Description?.Length > 500)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidDraft);

        var binding = views is null ? null : await views.InspectAsync(source.SourceKey, request.ViewName, cancellationToken);
        if (binding is null)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidView);
        var outcome = await unitOfWork.ExecuteAtomicallyAsync(
            [$"global-crystal:identity:{source.SourceKey}:{request.ReportKey}"], async token =>
            {
                if (!policy.Allows(source.SourceKey, ReportingPermissions.CreateGlobalCrystalReports))
                    return Result.Failure<Guid>(errors.GlobalCrystalReportForbidden);
                if (await store.KeyExistsAsync(source.SourceKey, request.ReportKey, token))
                    return Result.Failure<Guid>(errors.CrystalReportDuplicateKey);
                var report = GlobalCrystalReport.CreateDraft(source.SourceKey, request.ReportKey,
                    request.DisplayName, request.Description, binding.ViewName, binding.Fingerprint);
                store.Add(report);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(report.Id);
            }, cancellationToken);
        if (outcome.IsFailure) return Result.Failure<CrystalReportDetailResponse>(outcome.Error);
        var detail = await store.DetailAsync(outcome.Value, cancellationToken);
        return detail is null ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound)
            : Result.Success(detail);
    }
}
