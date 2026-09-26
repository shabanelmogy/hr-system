using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Coordination;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using MediatR;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed class CreateCrystalReportCommandHandler(
    ICrystalReportStore store,
    ICrystalReportFileStorage fileStorage,
    IUnitOfWork unitOfWork,
    CrystalReportErrors errors)
    : ICommandHandler<CreateCrystalReportCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        CreateCrystalReportCommand request,
        CancellationToken cancellationToken)
    {
        var entityKey = request.EntityKey.Trim().ToLowerInvariant();
        var reportKey = CrystalReportRules.FileStemToKey(request.File.FileName);
        if (string.IsNullOrWhiteSpace(reportKey) ||
            !CrystalReportRules.MatchesEntityPrefix(reportKey, entityKey))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidFile);

        if (await store.ReportKeyExistsAsync(entityKey, reportKey, cancellationToken))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportDuplicateKey);

        var stored = await fileStorage.StoreAsync(request.File, cancellationToken);
        if (!stored.IsSuccess)
            return Result.Failure<CrystalReportDetailResponse>(ToStorageError(stored.Failure, errors));

        var file = stored.File!;
        (bool Created, Guid ReportId) outcome;
        try
        {
            outcome = await unitOfWork.ExecuteAtomicallyAsync(
                [CrystalReportLocks.Identity(entityKey, reportKey)],
                async token =>
                {
                    if (await store.ReportKeyExistsAsync(entityKey, reportKey, token))
                        return (false, Guid.Empty);

                    var displayName = string.IsNullOrWhiteSpace(file.SummaryTitle)
                        ? Path.GetFileNameWithoutExtension(file.OriginalFileName).Trim()
                        : file.SummaryTitle;
                    var report = CrystalReport.Create(entityKey, reportKey, displayName!, request.Description);
                    var version = CreateVersion(report.Id, 1, file);
                    report.AddVersion(version);
                    store.Add(report);
                    await unitOfWork.SaveChangesAsync(token);
                    return (true, report.Id);
                },
                cancellationToken);
        }
        catch
        {
            await fileStorage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
            throw;
        }

        if (!outcome.Created)
        {
            await fileStorage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportDuplicateKey);
        }

        var detail = await store.GetDetailAsync(
            outcome.ReportId, includeArchived: true, requiredRight: null,
            bypassAcl: true, cancellationToken);
        return Result.Success(detail!);
    }

    internal static CrystalReportVersion CreateVersion(
        Guid reportId, int versionNumber, StoredCrystalReportFile file) =>
        CrystalReportVersion.Create(
            reportId, versionNumber, file.StorageKey, file.OriginalFileName,
            file.Size, file.Sha256, file.SummaryTitle, file.SummarySubject,
            CrystalReportValidationStatus.Valid, null);

    internal static Error ToStorageError(
        CrystalReportFileFailure failure, CrystalReportErrors errors) => failure switch
        {
            CrystalReportFileFailure.TooLarge => errors.CrystalReportFileTooLarge,
            CrystalReportFileFailure.InspectionUnavailable => errors.CrystalReportInspectorUnavailable,
            _ => errors.CrystalReportInvalidFile
        };
}

public sealed class AddCrystalReportVersionCommandHandler(
    ICrystalReportStore store,
    ICrystalReportFileStorage fileStorage,
    ICurrentPermissionChecker permissions,
    IUnitOfWork unitOfWork,
    CrystalReportErrors errors)
    : ICommandHandler<AddCrystalReportVersionCommand, Result<CrystalReportVersionResponse>>
{
    public async Task<Result<CrystalReportVersionResponse>> Handle(
        AddCrystalReportVersionCommand request,
        CancellationToken cancellationToken)
    {
        var bypass = permissions.HasPermission(ReportingPermissions.EditCrystalReportAccess);
        var snapshot = await store.GetDetailAsync(
            request.ReportId,
            includeArchived: false,
            CrystalReportRight.Upload,
            bypass,
            cancellationToken);
        if (snapshot is null)
            return Result.Failure<CrystalReportVersionResponse>(errors.CrystalReportNotFound);

        var reportKey = CrystalReportRules.FileStemToKey(request.File.FileName);
        if (!CrystalReportRules.MatchesEntityPrefix(reportKey, snapshot.EntityKey))
            return Result.Failure<CrystalReportVersionResponse>(errors.CrystalReportInvalidFile);

        var stored = await fileStorage.StoreAsync(request.File, cancellationToken);
        if (!stored.IsSuccess)
            return Result.Failure<CrystalReportVersionResponse>(
                CreateCrystalReportCommandHandler.ToStorageError(stored.Failure, errors));

        var file = stored.File!;
        CrystalReportVersion? version;
        try
        {
            version = await unitOfWork.ExecuteAtomicallyAsync(
                [CrystalReportLocks.Report(request.ReportId)],
                async lockedCancellationToken =>
                {
                    var report = await store.GetForUpdateAsync(
                        request.ReportId,
                        lockedCancellationToken);
                    if (report is null || report.IsDeleted ||
                        (!bypass && !await store.HasRightAsync(
                            request.ReportId,
                            CrystalReportRight.Upload,
                            lockedCancellationToken)))
                        return null;

                    var versionNumber = await store.GetNextVersionNumberAsync(
                        request.ReportId,
                        lockedCancellationToken);
                    var added = CreateCrystalReportCommandHandler.CreateVersion(
                        request.ReportId,
                        versionNumber,
                        file);
                    report.AddVersion(added);
                    store.AddVersion(added);
                    await unitOfWork.SaveChangesAsync(lockedCancellationToken);
                    return added;
                },
                cancellationToken);
        }
        catch
        {
            await fileStorage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
            throw;
        }

        if (version is null)
        {
            await fileStorage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
            return Result.Failure<CrystalReportVersionResponse>(errors.CrystalReportNotFound);
        }

        return Result.Success(CrystalReportResponses.Version(version, isPublished: false));
    }
}

public sealed class PublishCrystalReportVersionCommandHandler(
    ICrystalReportStore store,
    ICurrentPermissionChecker permissions,
    IUnitOfWork unitOfWork,
    CrystalReportErrors errors)
    : ICommandHandler<PublishCrystalReportVersionCommand, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        PublishCrystalReportVersionCommand request,
        CancellationToken cancellationToken)
    {
        if (!TryDecodeRowVersion(request.RowVersion, out var rowVersion))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidRowVersion);
        var bypass = permissions.HasPermission(ReportingPermissions.EditCrystalReportAccess);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [CrystalReportLocks.Report(request.ReportId)],
            async token =>
            {
                var report = await store.GetForUpdateAsync(request.ReportId, token);
                if (report is null || report.IsDeleted ||
                    (!bypass && !await store.HasRightAsync(
                        report.Id,
                        CrystalReportRight.Publish,
                        token)))
                    return Result.Failure<Guid>(errors.CrystalReportNotFound);

                var version = await store.GetVersionAsync(report.Id, request.VersionId, token);
                if (version is null)
                    return Result.Failure<Guid>(errors.CrystalReportNotFound);
                if (version.ValidationStatus != CrystalReportValidationStatus.Valid)
                    return Result.Failure<Guid>(errors.CrystalReportVersionNotValidated);

                store.ApplyOriginalRowVersion(report, rowVersion);
                report.Publish(version);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(report.Id);
            },
            cancellationToken);
        if (!result.IsSuccess)
            return Result.Failure<CrystalReportDetailResponse>(result.Error);

        var detail = await store.GetDetailAsync(result.Value, true, null, true, cancellationToken);
        return Result.Success(detail!);
    }

    internal static bool TryDecodeRowVersion(string value, out byte[] rowVersion)
    {
        try { rowVersion = Convert.FromBase64String(value); return rowVersion.Length == 8; }
        catch (FormatException) { rowVersion = []; return false; }
    }
}

public sealed class ReplaceCrystalReportGrantsCommandHandler(
    ICrystalReportStore store,
    IUnitOfWork unitOfWork,
    CrystalReportErrors errors)
    : ICommandHandler<ReplaceCrystalReportGrantsCommand, Result<IReadOnlyList<CrystalReportRoleGrantResponse>>>
{
    public async Task<Result<IReadOnlyList<CrystalReportRoleGrantResponse>>> Handle(
        ReplaceCrystalReportGrantsCommand request,
        CancellationToken cancellationToken)
    {
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var rowVersion))
            return Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(errors.CrystalReportInvalidRowVersion);
        if (!await store.AreGrantRolesValidAsync(
                request.Grants.Select(x => x.RoleId).ToArray(), cancellationToken))
            return Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(errors.CrystalReportInvalidRole);

        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [CrystalReportLocks.Report(request.ReportId)],
            async token =>
            {
                var report = await store.GetForUpdateAsync(request.ReportId, token);
                if (report is null || report.IsDeleted)
                    return Result.Failure(errors.CrystalReportNotFound);

                var grants = request.Grants.Select(item => CrystalReportRoleGrant.Create(
                    report.Id, item.RoleId, CrystalReportRules.ParseRights(item.Rights))).ToArray();
                store.ApplyOriginalRowVersion(report, rowVersion);
                store.ReplaceGrants(report, grants);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
        if (!result.IsSuccess)
            return Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(result.Error);

        return Result.Success(await store.GetGrantsAsync(request.ReportId, cancellationToken));
    }
}

public sealed class ArchiveCrystalReportCommandHandler(
    ICrystalReportStore store,
    IUnitOfWork unitOfWork,
    CrystalReportErrors errors)
    : ICommandHandler<ArchiveCrystalReportCommand, Result>
{
    public async Task<Result> Handle(ArchiveCrystalReportCommand request, CancellationToken cancellationToken)
    {
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var rowVersion))
            return Result.Failure(errors.CrystalReportInvalidRowVersion);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [CrystalReportLocks.Report(request.ReportId)],
            async token =>
            {
                var report = await store.GetForUpdateAsync(request.ReportId, token);
                if (report is null)
                    return Result.Failure(errors.CrystalReportNotFound);
                if (report.IsDeleted)
                    return Result.Success();

                store.ApplyOriginalRowVersion(report, rowVersion);
                report.Archive();
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}

public sealed class ImportDiscoveredCrystalReportCommandHandler(
    ICrystalReportDeploymentSource deploymentSource,
    ISender sender,
    CrystalReportErrors errors)
    : ICommandHandler<ImportDiscoveredCrystalReportCommand,
        Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        ImportDiscoveredCrystalReportCommand request,
        CancellationToken cancellationToken)
    {
        var catalog = await deploymentSource.ListAsync(null, cancellationToken);
        if (catalog is null)
            return Result.Failure<CrystalReportDetailResponse>(
                errors.CrystalReportCatalogUnavailable);

        var matches = catalog.Where(item =>
                string.Equals(item.SourceId, request.SourceId, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(item.Sha256, request.ExpectedSha256, StringComparison.OrdinalIgnoreCase))
            .ToArray();
        if (matches.Length != 1 || !matches[0].IsImportable)
            return Result.Failure<CrystalReportDetailResponse>(
                errors.CrystalReportDeploymentSourceChanged);

        var candidate = matches[0];
        var download = await deploymentSource.DownloadAsync(
            request.SourceId,
            request.ExpectedSha256,
            cancellationToken);
        if (download.Failure == CrystalReportDeploymentDownloadFailure.SourceChanged)
            return Result.Failure<CrystalReportDetailResponse>(
                errors.CrystalReportDeploymentSourceChanged);
        if (!download.IsSuccess)
            return Result.Failure<CrystalReportDetailResponse>(
                errors.CrystalReportCatalogUnavailable);

        return await sender.Send(
            new CreateCrystalReportCommand(candidate.EntityKey, request.Description, download.File!),
            cancellationToken);
    }
}

internal static class CrystalReportResponses
{
    internal static CrystalReportVersionResponse Version(CrystalReportVersion version, bool isPublished) =>
        new(version.Id, version.VersionNumber, version.OriginalFileName, version.Size,
            version.Sha256, version.SummaryTitle, version.SummarySubject,
            version.ValidationStatus.ToString(), version.ValidationReason,
            isPublished, version.CreatedOn);
}
