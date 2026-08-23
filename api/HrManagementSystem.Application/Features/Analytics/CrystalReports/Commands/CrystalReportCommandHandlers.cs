using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Errors;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Validation;
using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;
using MediatR;

namespace HrManagementSystem.Application.Features.Analytics.CrystalReports.Commands;

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
        var displayName = string.IsNullOrWhiteSpace(file.SummaryTitle)
            ? Path.GetFileNameWithoutExtension(file.OriginalFileName).Trim()
            : file.SummaryTitle;
        var report = CrystalReport.Create(entityKey, reportKey, displayName!, request.Description);
        var version = CreateVersion(report.Id, 1, file);
        report.AddVersion(version);
        store.Add(report);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await fileStorage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
            throw;
        }

        var detail = await store.GetDetailAsync(
            report.Id, includeArchived: true, requiredRight: null,
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
        var report = await store.GetForUpdateAsync(request.ReportId, cancellationToken);
        var bypass = permissions.HasPermission(Permissions.ManageCrystalReportAccess);
        if (report is null || report.IsDeleted ||
            (!bypass && !await store.HasRightAsync(report.Id, CrystalReportRight.Upload, cancellationToken)))
            return Result.Failure<CrystalReportVersionResponse>(errors.CrystalReportNotFound);

        var reportKey = CrystalReportRules.FileStemToKey(request.File.FileName);
        if (!CrystalReportRules.MatchesEntityPrefix(reportKey, report.EntityKey))
            return Result.Failure<CrystalReportVersionResponse>(errors.CrystalReportInvalidFile);

        var stored = await fileStorage.StoreAsync(request.File, cancellationToken);
        if (!stored.IsSuccess)
            return Result.Failure<CrystalReportVersionResponse>(
                CreateCrystalReportCommandHandler.ToStorageError(stored.Failure, errors));

        var file = stored.File!;
        var versionNumber = await store.GetNextVersionNumberAsync(report.Id, cancellationToken);
        var version = CreateCrystalReportCommandHandler.CreateVersion(report.Id, versionNumber, file);
        store.AddVersion(version);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await fileStorage.DeleteIfExistsAsync(file.StorageKey, CancellationToken.None);
            throw;
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
        var report = await store.GetForUpdateAsync(request.ReportId, cancellationToken);
        var bypass = permissions.HasPermission(Permissions.ManageCrystalReportAccess);
        if (report is null || report.IsDeleted ||
            (!bypass && !await store.HasRightAsync(report.Id, CrystalReportRight.Publish, cancellationToken)))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);

        var version = await store.GetVersionAsync(report.Id, request.VersionId, cancellationToken);
        if (version is null)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
        if (version.ValidationStatus != CrystalReportValidationStatus.Valid)
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportVersionNotValidated);
        if (!TryDecodeRowVersion(request.RowVersion, out var rowVersion))
            return Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportInvalidRowVersion);

        store.ApplyOriginalRowVersion(report, rowVersion);
        report.Publish(version.Id, version.SummaryTitle, version.OriginalFileName);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var detail = await store.GetDetailAsync(report.Id, true, null, true, cancellationToken);
        return Result.Success(detail!);
    }

    internal static bool TryDecodeRowVersion(string value, out byte[] rowVersion)
    {
        try { rowVersion = Convert.FromBase64String(value); return rowVersion.Length > 0; }
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
        var report = await store.GetForUpdateAsync(request.ReportId, cancellationToken);
        if (report is null)
            return Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(errors.CrystalReportNotFound);
        if (!await store.AreGrantRolesValidAsync(
                request.Grants.Select(x => x.RoleId).ToArray(), cancellationToken))
            return Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(errors.CrystalReportInvalidRole);
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var rowVersion))
            return Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(errors.CrystalReportInvalidRowVersion);

        var grants = request.Grants.Select(item => CrystalReportRoleGrant.Create(
            report.Id, item.RoleId, CrystalReportRules.ParseRights(item.Rights))).ToArray();
        store.ApplyOriginalRowVersion(report, rowVersion);
        store.ReplaceGrants(report, grants);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(await store.GetGrantsAsync(report.Id, cancellationToken));
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
        var report = await store.GetForUpdateAsync(request.ReportId, cancellationToken);
        if (report is null)
            return Result.Failure(errors.CrystalReportNotFound);
        if (!PublishCrystalReportVersionCommandHandler.TryDecodeRowVersion(request.RowVersion, out var rowVersion))
            return Result.Failure(errors.CrystalReportInvalidRowVersion);

        store.ApplyOriginalRowVersion(report, rowVersion);
        report.Archive();
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public sealed class ImportDiscoveredCrystalReportCommandHandler(
    ICrystalReportLegacySource legacySource,
    ISender sender,
    CrystalReportErrors errors)
    : ICommandHandler<ImportDiscoveredCrystalReportCommand,
        Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        ImportDiscoveredCrystalReportCommand request,
        CancellationToken cancellationToken)
    {
        var catalog = await legacySource.ListAsync(null, cancellationToken);
        var matches = catalog?.Where(item =>
                item.SourceId.Equals(request.SourceId, StringComparison.OrdinalIgnoreCase) &&
                item.Sha256.Equals(request.ExpectedSha256, StringComparison.OrdinalIgnoreCase))
            .ToArray() ?? [];
        if (matches.Length != 1 || !matches[0].IsImportable)
            return Result.Failure<CrystalReportDetailResponse>(
                errors.CrystalReportCatalogUnavailable);
        var candidate = matches[0];

        var file = await legacySource.DownloadAsync(
            request.SourceId, request.ExpectedSha256, cancellationToken);
        if (file is null)
            return Result.Failure<CrystalReportDetailResponse>(
                errors.CrystalReportCatalogUnavailable);

        return await sender.Send(
            new CreateCrystalReportCommand(candidate.EntityKey, request.Description, file),
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
