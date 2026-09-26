using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed class GetPublishedCrystalReportsQueryHandler(
    ICrystalReportStore store,
    ICurrentPermissionChecker permissions)
    : IQueryHandler<GetPublishedCrystalReportsQuery, IReadOnlyList<CrystalReportListItemResponse>>
{
    public Task<IReadOnlyList<CrystalReportListItemResponse>> Handle(
        GetPublishedCrystalReportsQuery request, CancellationToken cancellationToken) =>
        store.ListPublishedAsync(
            request.EntityKey, request.Search, CrystalReportRight.Run,
            permissions.HasPermission(ReportingPermissions.ViewCrystalReportAccess), cancellationToken);
}

public sealed class GetGlobalCrystalReportsQueryHandler(
    ICrystalReportDeploymentSource deploymentSource,
    CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportsQuery,
        Result<IReadOnlyList<GlobalCrystalReportListItemResponse>>>
{
    public async Task<Result<IReadOnlyList<GlobalCrystalReportListItemResponse>>> Handle(
        GetGlobalCrystalReportsQuery request,
        CancellationToken cancellationToken)
    {
        var entityKey = GlobalCrystalReportScope.Normalize(request.EntityKey);
        if (!GlobalCrystalReportScope.Contains(entityKey))
            return Result.Failure<IReadOnlyList<GlobalCrystalReportListItemResponse>>(
                errors.CrystalReportRenderUnsupported);

        var catalog = await deploymentSource.ListAsync(entityKey, cancellationToken);
        if (catalog is null)
            return Result.Failure<IReadOnlyList<GlobalCrystalReportListItemResponse>>(
                errors.CrystalReportCatalogUnavailable);

        var result = catalog
            .Where(item => item.IsImportable &&
                           string.Equals(item.EntityKey, entityKey, StringComparison.OrdinalIgnoreCase))
            .OrderBy(item => item.DisplayName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.ReportKey, StringComparer.OrdinalIgnoreCase)
            .Select(item => new GlobalCrystalReportListItemResponse(
                item.SourceId,
                entityKey,
                item.ReportKey,
                item.DisplayName,
                item.DisplayName,
                item.Subject,
                null,
                1,
                true,
                false,
                item.Sha256,
                item.LastModifiedUtc))
            .ToArray();

        return Result.Success<IReadOnlyList<GlobalCrystalReportListItemResponse>>(result);
    }
}

public sealed class RenderGlobalCrystalReportQueryHandler(
    ICrystalReportDeploymentSource deploymentSource,
    ICrystalReportDataSource dataSource,
    ICrystalReportRenderer renderer,
    CrystalReportErrors errors)
    : IQueryHandler<RenderGlobalCrystalReportQuery, Result<CrystalReportDownload>>
{
    public async Task<Result<CrystalReportDownload>> Handle(
        RenderGlobalCrystalReportQuery request,
        CancellationToken cancellationToken)
    {
        var entityKey = GlobalCrystalReportScope.Normalize(request.EntityKey);
        if (!GlobalCrystalReportScope.Contains(entityKey))
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportRenderUnsupported);

        var catalog = await deploymentSource.ListAsync(entityKey, cancellationToken);
        if (catalog is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportCatalogUnavailable);

        var matches = catalog.Where(item =>
                item.IsImportable &&
                string.Equals(item.EntityKey, entityKey, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(item.SourceId, request.SourceId, StringComparison.Ordinal) &&
                string.Equals(item.Sha256, request.ExpectedSha256, StringComparison.Ordinal))
            .ToArray();
        if (matches.Length != 1)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportDeploymentSourceChanged);

        var candidate = matches[0];
        var download = await deploymentSource.DownloadAsync(
            candidate.SourceId,
            candidate.Sha256,
            cancellationToken);
        if (download.Failure == CrystalReportDeploymentDownloadFailure.SourceChanged)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportDeploymentSourceChanged);
        if (!download.IsSuccess)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportSourceUnavailable);

        var dataResult = await dataSource.BuildAsync(
            entityKey,
            request.Filters ?? new Dictionary<string, string?>(),
            cancellationToken);
        if (!dataResult.IsSuccess)
        {
            return Result.Failure<CrystalReportDownload>(
                dataResult.Failure == CrystalReportDataFailure.TooLarge
                    ? errors.CrystalReportDataTooLarge
                    : errors.CrystalReportRenderUnsupported);
        }

        await using var source = download.File!.OpenReadStream();
        var rendered = await renderer.RenderAsync(new CrystalReportRuntimeRequest(
            entityKey,
            candidate.ReportKey,
            candidate.FileName,
            download.File.Length,
            source,
            request.Language,
            dataResult.Data!.Xml), cancellationToken);

        if (rendered.IsSuccess)
            return Result.Success(rendered.Report!);

        return Result.Failure<CrystalReportDownload>(rendered.Failure switch
        {
            CrystalReportRenderFailure.UnsupportedEntity => errors.CrystalReportRenderUnsupported,
            CrystalReportRenderFailure.InvalidReport => errors.CrystalReportInvalidFile,
            _ => errors.CrystalReportRuntimeUnavailable
        });
    }
}

internal static class GlobalCrystalReportScope
{
    private static readonly HashSet<string> EntityKeys = new(StringComparer.Ordinal)
    {
        "countries",
        "states",
        "districts"
    };

    internal static string Normalize(string entityKey) => entityKey.Trim().ToLowerInvariant();

    internal static bool Contains(string entityKey) => EntityKeys.Contains(entityKey);
}

public sealed class GetCrystalReportsManagementQueryHandler(ICrystalReportStore store)
    : IQueryHandler<GetCrystalReportsManagementQuery, CrystalReportPageResponse>
{
    public Task<CrystalReportPageResponse> Handle(
        GetCrystalReportsManagementQuery request, CancellationToken cancellationToken) =>
        store.ListManagementAsync(
            request.EntityKey, request.Search, request.Status,
            request.Page, request.PageSize, cancellationToken);
}

public sealed class GetCrystalReportDetailQueryHandler(
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetCrystalReportDetailQuery, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        GetCrystalReportDetailQuery request, CancellationToken cancellationToken)
    {
        var detail = await store.GetDetailAsync(
            request.ReportId, true, null, true, cancellationToken);
        return detail is null
            ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound)
            : Result.Success(detail);
    }
}

public sealed class GetCrystalReportVersionsQueryHandler(
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetCrystalReportVersionsQuery, Result<IReadOnlyList<CrystalReportVersionResponse>>>
{
    public async Task<Result<IReadOnlyList<CrystalReportVersionResponse>>> Handle(
        GetCrystalReportVersionsQuery request, CancellationToken cancellationToken)
    {
        var detail = await store.GetDetailAsync(request.ReportId, true, null, true, cancellationToken);
        return detail is null
            ? Result.Failure<IReadOnlyList<CrystalReportVersionResponse>>(errors.CrystalReportNotFound)
            : Result.Success(detail.Versions);
    }
}

public sealed class GetCrystalReportGrantsQueryHandler(
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetCrystalReportGrantsQuery, Result<IReadOnlyList<CrystalReportRoleGrantResponse>>>
{
    public async Task<Result<IReadOnlyList<CrystalReportRoleGrantResponse>>> Handle(
        GetCrystalReportGrantsQuery request, CancellationToken cancellationToken)
    {
        var detail = await store.GetDetailAsync(request.ReportId, true, null, true, cancellationToken);
        return detail is null
            ? Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(errors.CrystalReportNotFound)
            : Result.Success(detail.Access);
    }
}

public sealed class GetCrystalReportGrantRoleOptionsQueryHandler(ICrystalReportStore store)
    : IQueryHandler<GetCrystalReportGrantRoleOptionsQuery, IReadOnlyList<CrystalReportRoleOptionResponse>>
{
    public Task<IReadOnlyList<CrystalReportRoleOptionResponse>> Handle(
        GetCrystalReportGrantRoleOptionsQuery request,
        CancellationToken cancellationToken) =>
        store.GetGrantRoleOptionsAsync(cancellationToken);
}

public sealed class DownloadCrystalReportQueryHandler(
    ICrystalReportStore store,
    ICrystalReportFileStorage fileStorage,
    ICurrentPermissionChecker permissions,
    CrystalReportErrors errors)
    : IQueryHandler<DownloadCrystalReportQuery, Result<CrystalReportDownload>>
{
    public async Task<Result<CrystalReportDownload>> Handle(
        DownloadCrystalReportQuery request, CancellationToken cancellationToken)
    {
        var bypass = permissions.HasPermission(ReportingPermissions.ViewCrystalReportAccess);
        if (!bypass && !await store.HasRightAsync(
                request.ReportId, CrystalReportRight.Download, cancellationToken))
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        var version = await store.GetDownloadVersionAsync(
            request.ReportId, request.VersionId, cancellationToken);
        if (version is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        var stream = await fileStorage.OpenVerifiedReadAsync(
            version.StorageKey,
            version.Size,
            version.Sha256,
            cancellationToken);
        if (stream is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportSourceUnavailable);

        return Result.Success(new CrystalReportDownload(
            stream, version.OriginalFileName, "application/octet-stream", version.Size));
    }
}

public sealed class RenderCrystalReportQueryHandler(
    ICrystalReportStore store,
    ICrystalReportFileStorage fileStorage,
    ICrystalReportDataSource dataSource,
    ICrystalReportRenderer renderer,
    ICurrentPermissionChecker permissions,
    CrystalReportErrors errors)
    : IQueryHandler<RenderCrystalReportQuery, Result<CrystalReportDownload>>
{
    public async Task<Result<CrystalReportDownload>> Handle(
        RenderCrystalReportQuery request, CancellationToken cancellationToken)
    {
        var bypass = permissions.HasPermission(ReportingPermissions.ViewCrystalReportAccess);
        var report = await store.GetDetailAsync(
            request.ReportId, false, CrystalReportRight.Run, bypass, cancellationToken);
        if (report is null || !report.IsPublished)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        var version = await store.GetDownloadVersionAsync(
            request.ReportId, null, cancellationToken);
        if (version is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        await using var source = await fileStorage.OpenVerifiedReadAsync(
            version.StorageKey,
            version.Size,
            version.Sha256,
            cancellationToken);
        if (source is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportSourceUnavailable);

        var filters = request.Filters ?? new Dictionary<string, string?>();
        var dataResult = await dataSource.BuildAsync(
            report.EntityKey, filters, cancellationToken);
        if (!dataResult.IsSuccess)
            return Result.Failure<CrystalReportDownload>(
                dataResult.Failure == CrystalReportDataFailure.TooLarge
                    ? errors.CrystalReportDataTooLarge
                    : errors.CrystalReportRenderUnsupported);
        var data = dataResult.Data!;

        var rendered = await renderer.RenderAsync(new CrystalReportRuntimeRequest(
            report.EntityKey,
            report.ReportKey,
            version.OriginalFileName,
            version.Size,
            source,
            request.Language,
            data.Xml), cancellationToken);

        if (rendered.IsSuccess)
            return Result.Success(rendered.Report!);

        return Result.Failure<CrystalReportDownload>(rendered.Failure switch
        {
            CrystalReportRenderFailure.UnsupportedEntity => errors.CrystalReportRenderUnsupported,
            CrystalReportRenderFailure.InvalidReport => errors.CrystalReportInvalidFile,
            _ => errors.CrystalReportRuntimeUnavailable
        });
    }
}

public sealed class GetDiscoveredCrystalReportsQueryHandler(
    ICrystalReportDeploymentSource deploymentSource,
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetDiscoveredCrystalReportsQuery,
        Result<IReadOnlyList<DiscoveredCrystalReportResponse>>>
{
    public async Task<Result<IReadOnlyList<DiscoveredCrystalReportResponse>>> Handle(
        GetDiscoveredCrystalReportsQuery request,
        CancellationToken cancellationToken)
    {
        var discovered = await deploymentSource.ListAsync(request.EntityKey, cancellationToken);
        if (discovered is null)
            return Result.Failure<IReadOnlyList<DiscoveredCrystalReportResponse>>(
                errors.CrystalReportCatalogUnavailable);

        var imported = (await store.ListIdentitiesAsync(cancellationToken))
            .Select(item => Identity(item.EntityKey, item.ReportKey))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var response = discovered
            .OrderBy(item => item.EntityKey, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.DisplayName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.ReportKey, StringComparer.OrdinalIgnoreCase)
            .Select(item => new DiscoveredCrystalReportResponse(
                item.SourceId,
                item.EntityKey,
                item.ReportKey,
                item.FileName,
                item.DisplayName,
                item.Subject,
                item.Size,
                item.Sha256,
                item.LastModifiedUtc,
                item.IsImportable,
                item.ValidationReason,
                imported.Contains(Identity(item.EntityKey, item.ReportKey))))
            .ToArray();

        return Result.Success<IReadOnlyList<DiscoveredCrystalReportResponse>>(response);
    }

    private static string Identity(string entityKey, string reportKey) =>
        $"{entityKey}\u001f{reportKey}";
}

