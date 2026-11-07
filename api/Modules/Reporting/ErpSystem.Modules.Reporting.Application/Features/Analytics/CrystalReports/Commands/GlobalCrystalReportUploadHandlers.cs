using ErpSystem.Modules.Reporting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed class CreateGlobalCrystalReportCommandHandler(IGlobalCrystalReportStore store,
    ICrystalReportFileStorage storage, IReportingUnitOfWork unitOfWork, GlobalCrystalReportPolicy policy,
    IManagedCrystalReportContractSource contracts, CrystalReportErrors errors)
    : ICommandHandler<CreateGlobalCrystalReportCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(CreateGlobalCrystalReportCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.EntityKey, ReportingPermissions.CreateGlobalCrystalReports))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        var key = CrystalReportRules.FileStemToKey(request.File.FileName);
        if (!CrystalReportRules.IsValidKey(key) || key.Length > 128 ||
            !CrystalReportRules.MatchesEntityPrefix(key, request.EntityKey))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidFile);
        if (await store.KeyExistsAsync(request.EntityKey, key, cancellationToken))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportDuplicateKey);
        var stored = await storage.StoreAsync(request.EntityKey, request.File, cancellationToken);
        if (!stored.IsSuccess)
            return Result.Failure<CrystalReportDetailResponse>(CreateCrystalReportCommandHandler.ToStorageError(stored.Failure, errors));
        var file = stored.File!;
        var committed = false;
        try
        {
            if (file.ValidationContractSchemaVersion != contracts.SchemaVersion || file.ValidationContractFingerprint != contracts.Fingerprint)
                return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportContractStale);
            var id = await unitOfWork.ExecuteAtomicallyAsync(
                [$"global-crystal:identity:{request.EntityKey}:{key}"], async token =>
                {
                    if (!policy.Allows(request.EntityKey, ReportingPermissions.CreateGlobalCrystalReports) ||
                        await store.KeyExistsAsync(request.EntityKey, key, token)) return Guid.Empty;
                    var report = GlobalCrystalReport.Create(request.EntityKey, key, request.Description);
                    report.AddVersion(NewVersion(report.Id, 1, file));
                    store.Add(report);
                    await unitOfWork.SaveChangesAsync(token);
                    return report.Id;
                }, cancellationToken);
            if (id == Guid.Empty) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportDuplicateKey);
            committed = true;
            var detail = await store.DetailAsync(id, cancellationToken);
            return detail is null ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound) : Result.Success(detail);
        }
        finally
        {
            if (!committed) await storage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
        }
    }

    internal static GlobalCrystalReportVersion NewVersion(Guid id, int number, StoredCrystalReportFile file) =>
        GlobalCrystalReportVersion.Create(id, number, file.StorageKey, file.OriginalFileName, file.Size, file.Sha256,
            file.SummaryTitle, file.SummarySubject, file.ValidationContractSchemaVersion, file.ValidationContractFingerprint);
}

public sealed class UploadGlobalCrystalReportVersionCommandHandler(IGlobalCrystalReportStore store,
    ICrystalReportFileStorage storage, IReportingUnitOfWork unitOfWork, GlobalCrystalReportPolicy policy,
    IManagedCrystalReportContractSource contracts, CrystalReportErrors errors, IGlobalCrystalReportAccessStore access)
    : ICommandHandler<UploadGlobalCrystalReportVersionCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(UploadGlobalCrystalReportVersionCommand request,
        CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(key => policy.Allows(key, ReportingPermissions.UploadGlobalCrystalReports)))
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        var snapshot = await store.DetailAsync(request.ReportId, cancellationToken);
        if (snapshot is null || snapshot.IsArchived || !policy.Allows(snapshot.EntityKey, ReportingPermissions.UploadGlobalCrystalReports) ||
            !policy.BypassesRoleGrants(snapshot.EntityKey) && !await access.HasRightAsync(snapshot.Id, CrystalReportRight.Upload, cancellationToken))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
        var key = CrystalReportRules.FileStemToKey(request.File.FileName);
        if (!CrystalReportRules.MatchesEntityPrefix(key, snapshot.EntityKey))
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
            var changed = await unitOfWork.ExecuteAtomicallyAsync([$"global-crystal:report:{request.ReportId:N}"],
                async token =>
                {
                    var report = await store.FindAsync(request.ReportId, token);
                    if (report is null || report.IsDeleted || !policy.Allows(report.EntityKey, ReportingPermissions.UploadGlobalCrystalReports) ||
                        !policy.BypassesRoleGrants(report.EntityKey) && !await access.HasRightAsync(report.Id, CrystalReportRight.Upload, token)) return false;
                    var number = await store.NextVersionAsync(report.Id, token);
                    var version = CreateGlobalCrystalReportCommandHandler.NewVersion(report.Id, number, file);
                    report.AddVersion(version);
                    store.AddVersion(version);
                    await unitOfWork.SaveChangesAsync(token);
                    return true;
                }, cancellationToken);
            if (!changed) return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
            committed = true;
            var detail = await store.DetailAsync(request.ReportId, cancellationToken);
            return detail is null ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound) : Result.Success(detail);
        }
        finally
        {
            if (!committed) await storage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
        }
    }
}
