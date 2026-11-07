using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using MediatR;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed class PublishGlobalCrystalReportVersionCommandHandler(IGlobalCrystalReportStore store,
    GlobalCrystalReportPolicy policy, IReportingUnitOfWork unitOfWork,
    IManagedCrystalReportContractSource contracts, CrystalReportErrors errors, IGlobalCrystalReportAccessStore access)
    : ICommandHandler<PublishGlobalCrystalReportVersionCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(PublishGlobalCrystalReportVersionCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(key => policy.Allows(key, ReportingPermissions.PublishGlobalCrystalReports)))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var rowVersion))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidRowVersion);
        var result = await unitOfWork.ExecuteAtomicallyAsync([$"global-crystal:report:{request.ReportId:N}"], async token =>
        {
            var report = await store.FindAsync(request.ReportId, token);
            if (report is null || report.IsDeleted || !policy.Allows(report.EntityKey, ReportingPermissions.PublishGlobalCrystalReports) ||
                !policy.BypassesRoleGrants(report.EntityKey) && !await access.HasRightAsync(report.Id, CrystalReportRight.Publish, token))
                return Result.Failure(errors.CrystalReportNotFound);
            if (!report.RowVersion.SequenceEqual(rowVersion)) return Result.Failure(errors.CrystalReportConcurrencyConflict);
            var version = await store.VersionAsync(report.Id, request.VersionId, token);
            if (version is null) return Result.Failure(errors.CrystalReportNotFound);
            if (version.ValidationStatus != CrystalReportValidationStatus.Valid) return Result.Failure(errors.CrystalReportVersionNotValidated);
            if (!version.IsValidFor(contracts.Fingerprint)) return Result.Failure(errors.CrystalReportContractStale);
            store.ApplyRowVersion(report, rowVersion);
            report.Publish(version, contracts.Fingerprint);
            await unitOfWork.SaveChangesAsync(token);
            return Result.Success();
        }, cancellationToken);
        if (!result.IsSuccess) return Result.Failure<CrystalReportDetailResponse>(result.Error);
        var detail = await store.DetailAsync(request.ReportId, cancellationToken);
        return detail is null ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound) : Result.Success(detail);
    }
}

public sealed class RevalidateGlobalCrystalReportVersionCommandHandler(IGlobalCrystalReportStore store,
    GlobalCrystalReportPolicy policy, IReportingUnitOfWork unitOfWork, ICrystalReportFileStorage storage,
    ICrystalReportInspector inspector, IManagedCrystalReportContractSource contracts, CrystalReportErrors errors, IGlobalCrystalReportAccessStore access)
    : ICommandHandler<RevalidateGlobalCrystalReportVersionCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(RevalidateGlobalCrystalReportVersionCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(key => policy.Allows(key, ReportingPermissions.UploadGlobalCrystalReports)))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        var detail = await store.DetailAsync(request.ReportId, cancellationToken);
        if (detail is null || detail.IsArchived || !policy.Allows(detail.EntityKey, ReportingPermissions.UploadGlobalCrystalReports) ||
            !policy.BypassesRoleGrants(detail.EntityKey) && !await access.HasRightAsync(detail.Id, CrystalReportRight.Upload, cancellationToken))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
        var version = await store.VersionAsync(detail.Id, request.VersionId, cancellationToken);
        if (version is null) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
        await using var source = await storage.OpenVerifiedReadAsync(version.StorageKey, version.Size, version.Sha256, cancellationToken);
        if (source is null) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportSourceUnavailable);
        var inspection = await inspector.InspectAsync(detail.EntityKey,
            new FileUpload(version.OriginalFileName, "application/octet-stream", version.Size, () => source), cancellationToken);
        if (inspection is null) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInspectorUnavailable);
        if (inspection.IsValid && (inspection.Failure != CrystalReportInspectionFailure.None ||
            inspection.ContractSchemaVersion != contracts.SchemaVersion || inspection.ContractFingerprint != contracts.Fingerprint))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportContractStale);
        var recorded = await unitOfWork.ExecuteAtomicallyAsync([$"global-crystal:report:{request.ReportId:N}"], async token =>
        {
            var report = await store.FindAsync(request.ReportId, token);
            if (report is null || report.IsDeleted || !policy.Allows(report.EntityKey, ReportingPermissions.UploadGlobalCrystalReports) ||
                !policy.BypassesRoleGrants(report.EntityKey) && !await access.HasRightAsync(report.Id, CrystalReportRight.Upload, token))
                return false;
            version.RecordValidation(inspection.IsValid, inspection.ValidationReason ?? errors.CrystalReportInvalidFile.Description,
                contracts.SchemaVersion, contracts.Fingerprint);
            await unitOfWork.SaveChangesAsync(token);
            return true;
        }, cancellationToken);
        if (!recorded) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
        var updated = await store.DetailAsync(request.ReportId, cancellationToken);
        return updated is null ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound) : Result.Success(updated);
    }
}

public sealed class VerifyDatabaseGlobalCrystalReportVersionCommandHandler(
    IGlobalCrystalReportStore store,
    ICrystalReportFileStorage storage,
    ICrystalReportDatabaseVerifier verifier,
    IReportingUnitOfWork unitOfWork,
    GlobalCrystalReportPolicy policy,
    IManagedCrystalReportContractSource contracts,
    CrystalReportErrors errors,
    IGlobalCrystalReportAccessStore access)
    : ICommandHandler<VerifyDatabaseGlobalCrystalReportVersionCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        VerifyDatabaseGlobalCrystalReportVersionCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(key => policy.Allows(key, ReportingPermissions.UploadGlobalCrystalReports) &&
                                                   policy.Allows(key, ReportingPermissions.PublishGlobalCrystalReports)))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);

        var detail = await store.DetailAsync(request.ReportId, cancellationToken);
        if (detail is null || detail.IsArchived ||
            !policy.Allows(detail.EntityKey, ReportingPermissions.UploadGlobalCrystalReports) ||
            !policy.Allows(detail.EntityKey, ReportingPermissions.PublishGlobalCrystalReports) ||
            !policy.BypassesRoleGrants(detail.EntityKey) &&
            (!await access.HasRightAsync(detail.Id, CrystalReportRight.Upload, cancellationToken) ||
             !await access.HasRightAsync(detail.Id, CrystalReportRight.Publish, cancellationToken)))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);

        var sourceVersion = await store.VersionAsync(detail.Id, request.VersionId, cancellationToken);
        if (sourceVersion is null)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);

        await using var source = await storage.OpenVerifiedReadAsync(
            sourceVersion.StorageKey, sourceVersion.Size, sourceVersion.Sha256, cancellationToken);
        if (source is null)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportSourceUnavailable);

        var verified = await verifier.VerifyDatabaseAsync(
            detail.EntityKey,
            new FileUpload(sourceVersion.OriginalFileName, "application/octet-stream", sourceVersion.Size, () => source),
            cancellationToken);
        if (verified is null)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportDatabaseVerificationUnavailable);

        var stored = await storage.StoreAsync(detail.EntityKey, verified, cancellationToken);
        if (!stored.IsSuccess)
            return Result.Failure<CrystalReportDetailResponse>(
                CreateCrystalReportCommandHandler.ToStorageError(stored.Failure, errors));
        var file = stored.File!;
        var committed = false;
        try
        {
            if (file.ValidationContractSchemaVersion != contracts.SchemaVersion ||
                file.ValidationContractFingerprint != contracts.Fingerprint)
                return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportContractStale);
            var result = await unitOfWork.ExecuteAtomicallyAsync(
                [$"global-crystal:report:{request.ReportId:N}"],
                async token =>
                {
                    var report = await store.FindAsync(request.ReportId, token);
                    if (report is null || report.IsDeleted ||
                        !policy.Allows(report.EntityKey, ReportingPermissions.UploadGlobalCrystalReports) ||
                        !policy.Allows(report.EntityKey, ReportingPermissions.PublishGlobalCrystalReports) ||
                        !policy.BypassesRoleGrants(report.EntityKey) &&
                        (!await access.HasRightAsync(report.Id, CrystalReportRight.Upload, token) ||
                         !await access.HasRightAsync(report.Id, CrystalReportRight.Publish, token)))
                        return Result.Failure(errors.CrystalReportNotFound);

                    var number = await store.NextVersionAsync(report.Id, token);
                    var version = CreateGlobalCrystalReportCommandHandler.NewVersion(report.Id, number, file);
                    report.AddVersion(version);
                    store.AddVersion(version);
                    report.Publish(version, contracts.Fingerprint);
                    await unitOfWork.SaveChangesAsync(token);
                    return Result.Success();
                }, cancellationToken);
            if (!result.IsSuccess) return Result.Failure<CrystalReportDetailResponse>(result.Error);
            committed = true;
            var updated = await store.DetailAsync(request.ReportId, cancellationToken);
            return updated is null ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound) : Result.Success(updated);
        }
        finally
        {
            if (!committed) await storage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
        }
    }
}

public sealed class InspectGlobalCrystalReportCommandHandler(GlobalCrystalReportPolicy policy,
    ICrystalReportInspector inspector, CrystalReportErrors errors)
    : ICommandHandler<InspectGlobalCrystalReportCommand, Result<CrystalReportInspection>>
{
    public async Task<Result<CrystalReportInspection>> Handle(InspectGlobalCrystalReportCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.EntityKey, ReportingPermissions.UploadGlobalCrystalReports))
            return Result.Failure<CrystalReportInspection>(errors.GlobalCrystalReportForbidden);
        if (request.File.Length <= 0 || request.File.Length > 10L * 1024 * 1024 ||
            !string.Equals(Path.GetExtension(request.File.FileName), ".rpt", StringComparison.OrdinalIgnoreCase))
            return Result.Failure<CrystalReportInspection>(errors.CrystalReportInvalidFile);
        var result = await inspector.InspectAsync(request.EntityKey, request.File, cancellationToken);
        return result is null ? Result.Failure<CrystalReportInspection>(errors.CrystalReportInspectorUnavailable) : Result.Success(result);
    }
}

public sealed class ImportGlobalCrystalReportCommandHandler(GlobalCrystalReportPolicy policy,
    ICrystalReportDeploymentSource source, ISender sender, CrystalReportErrors errors)
    : ICommandHandler<ImportGlobalCrystalReportCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(ImportGlobalCrystalReportCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.EntityKey, ReportingPermissions.CreateGlobalCrystalReports))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        var candidates = await source.ListAsync(request.EntityKey, cancellationToken);
        if (candidates is null) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportCatalogUnavailable);
        if (!candidates.Any(candidate => candidate.EntityKey == request.EntityKey && candidate.SourceId == request.SourceId &&
            candidate.IsImportable && candidate.Sha256 == request.ExpectedSha256))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportDeploymentSourceChanged);
        var downloaded = await source.DownloadAsync(request.SourceId, request.ExpectedSha256, cancellationToken);
        if (!downloaded.IsSuccess) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportDeploymentSourceChanged);
        return await sender.Send(new CreateGlobalCrystalReportCommand(request.EntityKey, null, downloaded.File!), cancellationToken);
    }
}
