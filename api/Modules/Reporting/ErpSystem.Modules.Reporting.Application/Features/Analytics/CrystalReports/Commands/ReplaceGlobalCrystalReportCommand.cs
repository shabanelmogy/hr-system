using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed record ReplaceGlobalCrystalReportCommand(Guid ReportId, string RowVersion, FileUpload File)
    : ICommand<Result<CrystalReportDetailResponse>>;

public sealed class ReplaceGlobalCrystalReportCommandValidator : AbstractValidator<ReplaceGlobalCrystalReportCommand>
{
    public ReplaceGlobalCrystalReportCommandValidator()
    {
        RuleFor(request => request.ReportId).NotEmpty();
        RuleFor(request => request.RowVersion).NotEmpty().Must(PublishCrystalReportVersionCommandValidator.IsSqlServerRowVersion);
        RuleFor(request => request.File).NotNull();
    }
}

public sealed class ReplaceGlobalCrystalReportCommandHandler(IGlobalCrystalReportStore store,
    ICrystalReportFileStorage storage, IReportingUnitOfWork unitOfWork, GlobalCrystalReportPolicy policy,
    IManagedCrystalReportContractSource contracts, CrystalReportErrors errors, IGlobalCrystalReportAccessStore access)
    : ICommandHandler<ReplaceGlobalCrystalReportCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(ReplaceGlobalCrystalReportCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(CanReplaceEntity))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var expected))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidRowVersion);
        var snapshot = await store.DetailAsync(request.ReportId, cancellationToken);
        if (snapshot is null || snapshot.IsArchived || !CanReplaceEntity(snapshot.EntityKey) ||
            !await HasReportRightsAsync(request.ReportId, snapshot.EntityKey, cancellationToken))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
        if (!Convert.FromBase64String(snapshot.RowVersion).SequenceEqual(expected))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportConcurrencyConflict);
        // This endpoint replaces the duplicate filename identity, never another report in the entity.
        if (CrystalReportRules.FileStemToKey(request.File.FileName) != snapshot.ReportKey)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidFile);

        var stored = await storage.StoreAsync(snapshot.EntityKey, request.File, cancellationToken);
        if (!stored.IsSuccess)
            return Result.Failure<CrystalReportDetailResponse>(CreateCrystalReportCommandHandler.ToStorageError(stored.Failure, errors));
        var file = stored.File!;
        var committed = false;
        try
        {
            if (file.ValidationContractSchemaVersion != contracts.SchemaVersion || file.ValidationContractFingerprint != contracts.Fingerprint)
                return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportContractStale);
            var result = await unitOfWork.ExecuteAtomicallyAsync([$"global-crystal:report:{request.ReportId:N}"], async token =>
            {
                var report = await store.FindAsync(request.ReportId, token);
                if (report is null || report.IsDeleted || !CanReplaceEntity(report.EntityKey) ||
                    !await HasReportRightsAsync(report.Id, report.EntityKey, token))
                    return Result.Failure(errors.CrystalReportNotFound);
                if (!report.RowVersion.SequenceEqual(expected))
                    return Result.Failure(errors.CrystalReportConcurrencyConflict);
                var number = await store.NextVersionAsync(report.Id, token);
                var version = CreateGlobalCrystalReportCommandHandler.NewVersion(report.Id, number, file);
                report.AddVersion(version);
                store.AddVersion(version);
                store.ApplyRowVersion(report, expected);
                report.Publish(version, contracts.Fingerprint);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            }, cancellationToken);
            if (!result.IsSuccess) return Result.Failure<CrystalReportDetailResponse>(result.Error);
            committed = true;
            var detail = await store.DetailAsync(request.ReportId, cancellationToken);
            return detail is null ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound) : Result.Success(detail);
        }
        finally
        {
            if (!committed) await storage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
        }
    }

    private bool CanReplaceEntity(string entityKey) =>
        policy.Allows(entityKey, ReportingPermissions.UploadGlobalCrystalReports) &&
        policy.Allows(entityKey, ReportingPermissions.PublishGlobalCrystalReports);

    private async Task<bool> HasReportRightsAsync(Guid reportId, string entityKey, CancellationToken token) =>
        policy.BypassesRoleGrants(entityKey) ||
        await access.HasRightAsync(reportId, CrystalReportRight.Upload, token) &&
        await access.HasRightAsync(reportId, CrystalReportRight.Publish, token);
}
